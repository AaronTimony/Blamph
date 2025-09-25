from pydantic import BaseModel

class NewWordPriorityRequest(BaseModel):
    card_id: int
