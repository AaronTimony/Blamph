from pydantic import BaseModel
from typing import Optional, List

class DeckWordsReq(BaseModel):
    deck_name: str
    page: int
    ordering: str

class DeckWordsRes(BaseModel):
    deck_name: str
    word_frequency: int
    jp_word: str
    meaning: List[str]
    reading: Optional[str]
    overall_rank: int
    level: Optional[int] = None
    known: Optional[bool] = None
    page: int
    total_pages: int



