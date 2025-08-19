import MeCab
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.word import Word
from app.models.wordDeck import WordDeck
from collections import Counter
from typing import List, Dict
import re
import chardet
import unidic

class SubtitleParser:
    def __init__(self):
        self.wakati = MeCab.Tagger(f'-d "{unidic.DICDIR}" -Owakati')

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

    def extract_words(self, text: str) -> List[str]:
        text = self.wakati.parse(text).split()

        return text

    def parse_srt_file(self, file_content: bytes, deck_id: int, db: Session) -> Dict:
        try:
            encoding = self.detect_encoding(file_content)
            content = file_content.decode(encoding)

            text = self.clean_subtitle_text(content)

            all_words = self.extract_words(text)

            words_count = Counter(all_words)

            unique_words = list(words_count.keys())

            for word_text, count in words_count.items():

                word_exist = db.query(Word).filter(Word.word_text == word_text).first()
                if not word_exist:
                    new_word = Word(word_text=word_text)
                    db.add(new_word)
                    db.flush()
                    word_exist = new_word

                existing_relation = db.query(WordDeck).filter(
                    WordDeck.word_id == word_exist.id,
                    WordDeck.deck_id == deck_id
                ).first()
                
                if not existing_relation:
                    new_relation = WordDeck(
                        word_id=word_exist.id,
                        deck_id=deck_id,
                        word_frequency=count
                    )
                    db.add(new_relation)
            db.commit()

            return {"success": True,
                    "total_words" : len(words_count)}
        except Exception as e:
            db.rollback()
            raise Exception(f"Error found in parsing SRT file: {str(e)}")

parser = SubtitleParser()

dirty_text = """
00:00:11,177 --> 00:00:13,930
（ロイ･マスタング）
氷結の錬金術師ですか？

2
00:00:14,055 --> 00:00:15,015
（キング･ブラッドレイ）そうだ

3
00:00:15,140 --> 00:00:17,475
彼がこの中央(セントラル)に
潜入している

4
00:00:18,476 --> 00:00:19,602
（ブラッドレイ）
ロイ･マスタング大佐

5
00:00:19,936 --> 00:00:23,148
その捕獲の
指揮を君に任せたいのだよ

6
00:00:23,273 --> 00:00:24,566
（マスタング）ご命令とあらば

7
00:00:24,691 --> 00:00:25,400
（ブラッドレイ）いや

8
00:00:25,567 --> 00:00:28,194
君が中央(セントラル)に
いてくれてよかったよ

9
00:00:28,319 --> 00:00:29,988
安心して任せられる

10
00:00:30,113 --> 00:00:30,780
（マスタング）はっ

11
00:00:30,905 --> 00:00:33,950
（ブラッドレイ）
ああ それと あの少年も来ている

12
00:00:34,075 --> 00:00:36,161
存分に使ってやりたまえ

13
00:00:36,286 --> 00:00:39,581
（マスタング）
ブラッドレイ大総統
少年とはもしかして…

14
00:00:39,748 --> 00:00:40,290
そう

15
00:00:40,999 --> 00:00:44,252
鋼の錬金術師
エドワード･エルリック

16
00:00:44,919 --> 00:00:48,256
（エドワード･エルリック）
ったく 人使いの荒い大佐だぜ

17
00:00:48,673 --> 00:00:52,552
（アルフォンス･エルリック）
せっかくリオール行きの
切符買ったのに キャンセルだね

18
00:00:52,761 --> 00:00:54,304
（エドワード）しょうがねえ

19
00:00:54,763 --> 00:00:57,390
ちゃっちゃと
終わらせちまおうぜ アル

20
00:00:57,515 --> 00:00:58,808
（アルフォンス）うん 兄さん

21
00:00:59,350 --> 00:01:05,355
♪～

22
00:02:22,684 --> 00:02:28,690
～♪

23
00:02:28,857 --> 00:02:32,110
（警笛）

24
00:02:32,235 --> 00:02:33,820
（足音）

25
00:02:33,945 --> 00:02:35,238
（兵士）行ったぞ そっちだ

26
00:02:35,488 --> 00:02:36,781
（兵士）止まれ 止まらんと…

27
00:02:39,868 --> 00:02:41,161
（兵士たち）うわあ

28
00:02:49,294 --> 00:02:51,629
（兵士）うわあ
"""
cleaned = parser.clean_subtitle_text(dirty_text)
print(parser.extract_words(cleaned))
