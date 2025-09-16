from pydantic import BaseModel
from typing import Optional

class DeckWordsReq(BaseModel):
    deck_name: str

class DeckWordsRes(BaseModel):
    deck_name: str
    word_frequency: int
    jp_word: str
    meaning: str
    overall_rank: int
    level: Optional[int] = None
    known: Optional[bool] = None



