from pydantic import BaseModel

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
