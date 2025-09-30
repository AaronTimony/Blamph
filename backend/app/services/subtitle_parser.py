from sudachipy import tokenizer
from sudachipy import dictionary
from jamdict import Jamdict
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.badwords import badwords, broken_words
from app.models.card import Card
from app.models.cardDeck import CardDeck
from collections import Counter
from typing import List, Dict, Tuple
import fugashi
import unidic
import re
import chardet
unidic_path = unidic.DICDIR

class SubtitleParser:
    def __init__(self):
        try:
            self.tokenizer_obj = dictionary.Dictionary().create()

            self.mode = tokenizer.Tokenizer.SplitMode.C

            self.jamdict = Jamdict()

        except Exception as e:
            print(f"Error in __init__: {e}")
            raise
        
    def detect_encoding(self, file_content: bytes) -> str:
        """Detect file encoding for Japanese text (UTF-8, Shift_JIS)
            This allows the decoder to know how to read the file and transfer
            it back into characters. When a file is read it is a bunch of bytes
            so we need these functions to read those files."""
        result = chardet.detect(file_content)

        return result['encoding'] or 'utf-8'

    def clean_subtitle_text(self, text: str) -> str:
        """Remove subtitle formatting and extract clean text"""
        # Remove sequence numbers (digits at start of line)
        text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
        # Remove timestamp lines
        text = re.sub(r'^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$', '', text, flags=re.MULTILINE)
        # Remove empty lines
        text = re.sub(r'\n\s*\n', '\n', text)
        # Clean up extra whitespace
        text = re.sub(r'[^\wぁ-んァ-ン一-龥\s]', '', text)

        return text

    def _is_useful_word(self, word) -> bool:
        """Filter non-useful word types"""

        pos1 = word.part_of_speech()[0]
        pos2 = word.part_of_speech()[1]
        lemma = word.dictionary_form()

        useful_pos = {'名詞', '動詞', '形容詞', '副詞', '形状詞', '代名詞'}

        skip_pos = {'助詞', '助動詞', '記号', '補助記号'}

        skip_pos2 = {
            '助動詞語幹'
        }

        if pos1 in skip_pos or pos2 in skip_pos2 or lemma in badwords:
            return False

        if pos1 == '名詞' and pos2 == '固有名詞':
            return False

        if pos1 in useful_pos:
            if pos1 == '名詞':
                skip_noun_types = {'数詞'}

                if pos2 in skip_noun_types:
                    return False

            return True

        return True

    def extract_cards(self, text: str, db: Session) -> List[str]:
        jp_words = []

        try:
            tokens = self.tokenizer_obj.tokenize(text, self.mode)

            for token in tokens:
                try:
                    if self._is_useful_word(token):
                        jp_words.append(token.dictionary_form())

                except Exception as e:
                    print(e)

        except Exception as e:
            print(f"Error in tokenization: {e}")
            print(f"Tokenizer object: {self.tokenizer_obj}")
            print(f"Mode: {self.mode}")
            raise

        return jp_words

    def extract_meaning_and_reading(self, word: str) -> Tuple[str | None, List | None]:
        """This function is a bit weird. I have created a list called broken_words, jamdict has this issue where its first entry will usually be the most common form a verb but not always. Sudachipy when two verbs are the same in kana form eg. いる it will not distinguish what form of verb this is based on context. So what I have done is manually set what the most common form of the verb isin kana form for these verbs. If the kanji form is found, then sudachi can use that form, otherwise it defaults to the form of the verb which i have manually set. I don't know how else to do this because the NLP simply does not do it for me so I have no other method other than manual."""
        meaning = None
        reading = None

        res = self.jamdict.lookup(word)

        has_kanji = any('\u4e00' <= c <= '\u9fff' for c in word)

        if word in broken_words:
            if has_kanji:
                meaning = broken_words[word][0]
                reading = broken_words[word][1]

            else:
                meaning = broken_words[word]
                reading = None

            return reading, [meaning]

        if res.entries:
            entry = res.entries[0]

            if has_kanji:
                for entry in res.entries:

                    for kanji_form in entry.kanji_forms:

                        if kanji_form.text == word:
                            reading = str(entry.kana_forms[0]) if entry.kana_forms else None
                            meaning = [sense.text().replace('/', '; ') for sense in entry.senses] if entry.senses else None
                            return reading, meaning

            else:
                reading = None

                if entry.senses:
                    meaning = [sense.text() for sense in entry.senses] if entry.senses else None

        return reading, meaning

    def parse_srt_file(self, file_content: bytes, deck_id: int, db: Session) -> Dict:
        try:
            encoding = self.detect_encoding(file_content)
            content = file_content.decode(encoding)

            text = self.clean_subtitle_text(content)

            all_words = self.extract_cards(text, db)

            words_count = Counter(all_words)

            for word, count in words_count.items():
                reading, meaning = self.extract_meaning_and_reading(word)

                try:
                    if meaning:
                        card = db.query(Card).filter(Card.jp_word == word).first()
                        if not card:
                            card = Card(jp_word=word,
                                        meaning=meaning,
                                        reading=reading,
                                        overall_frequency = count)
                            db.add(card)
                            db.flush()
                        else:
                            card.overall_frequency += count

                    else:
                        continue

                except Exception as e:
                    print(e)

                existing_relation = db.query(CardDeck).filter(
                    CardDeck.card_id == card.id,
                    CardDeck.deck_id == deck_id
                ).first()
                
                if not existing_relation:
                    new_relation = CardDeck(
                        card_id=card.id,
                        deck_id=deck_id,
                        word_frequency=count
                    )
                    db.add(new_relation)

                else:
                    continue

            db.commit()

            return {"success": True,
                    "total_words" : len(words_count)}

        except Exception as e:
            db.rollback()
            raise Exception(f"Error found in parsing SRT file: {str(e)}")
