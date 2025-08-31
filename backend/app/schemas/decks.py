from pydantic import BaseModel
from typing import Optional, List

class AddUser(BaseModel):
    user: str
    deck_name: str

class DeckResponse(BaseModel):
    deck_name: str
    username: str

class DeckAdd(BaseModel):
    deck_name: str
    image_url: str

class DeleteDeck(BaseModel):
    deck_name: str
    deck_order: int

class CreateDeck(BaseModel):
    deck_name: str
    image_url: Optional[str]

class MyDecksResponse(BaseModel):
    deck_name: str
    image_url: str
    unique_words: int
    total_words: int
    deck_order: int

    class Config:
        from_attributes=True

class DeckReorder(BaseModel):
    deck_name: str
    deck_order: int

class DeckOrderRequest(BaseModel):
    deckOrders: List[DeckReorder]
