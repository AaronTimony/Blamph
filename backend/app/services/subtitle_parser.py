from sudachipy import tokenizer
from sudachipy import dictionary
from jamdict import Jamdict
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.badwords import badwords
from app.models.card import Card
from app.models.cardDeck import CardDeck
from collections import Counter
from typing import List, Dict, Tuple
import re
import chardet

class SubtitleParser:
    def __init__(self):
        self.tokenizer_obj = dictionary.Dictionary(dict_type="full").create()

        self.mode = tokenizer.Tokenizer.SplitMode.C

        self.jamdict = Jamdict()
        
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

    def extract_cards(self, text: str, db: Session) -> List[str]:
        tokens = self.tokenizer_obj.tokenize(text, self.mode)

        jp_words = []
        for token in tokens:
            jp_word = token.dictionary_form()

            if jp_word and not jp_word.isspace() and jp_word not in badwords:
                jp_words.append(jp_word)

            else:
                continue

            db.query(Card).filter(Card.jp_word == jp_word)\
            .update({Card.overall_frequency: Card.overall_frequency + 1})

            db.commit()

        return jp_words

    def extract_meaning_and_reading(self, word: str) -> Tuple[str | None, str | None]:
        """Function used to get the meaning of Japanese word passed by extract_cards"""
        meaning = None
        reading = None

        res = self.jamdict.lookup(word)
        if res.entries != []:
            entry = res.entries[0]

            if entry.kana_forms[0]:
                reading = str(entry.kana_forms[0])
            if entry.senses:
                first_sense = entry.senses[0]
                if first_sense.gloss:
                    meaning = str(first_sense.gloss[0])


        return meaning, reading

    def parse_srt_file(self, file_content: bytes, deck_id: int, db: Session) -> Dict:
        try:
            encoding = self.detect_encoding(file_content)
            content = file_content.decode(encoding)

            text = self.clean_subtitle_text(content)

            all_words = self.extract_cards(text, db)

            words_count = Counter(all_words)

            for word, count in words_count.items():
                meaning, reading = self.extract_meaning_and_reading(word)

                if meaning:
                    card = db.query(Card).filter(Card.jp_word == word).first()
                    if not card:
                        card = Card(jp_word=word, meaning=meaning, reading=reading)
                        db.add(card)
                        db.flush()
                else:
                    continue

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
