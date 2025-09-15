from pydantic import BaseModel

class DeckWordsReq(BaseModel):
    deck_name: str

class DeckWordsRes(BaseModel):
    deck_name: str
    word_frequency: int
    jp_word: str
    meaning: str


