from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Newest_cards(BaseModel):
    meaning: str
    jp_word: str
    reading: str

    class Config:
        from_attributes = True

class Review_cards(BaseModel):
    meaning: Optional[str]
    jp_word: Optional[str]
    reading: Optional[str]

    class Config:
        from_attributes = True

class CardRatingRequest(BaseModel):
    rating: str
    jp_word: str

class CardCountsResponse(BaseModel):
    new_count: int
    due_count: int
    known_count: int



