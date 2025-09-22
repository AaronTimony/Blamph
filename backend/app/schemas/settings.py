from pydantic import BaseModel

class UpdateNewWordsRequest(BaseModel):
    newDailyWords: int

class UpdateNewWordOrder(BaseModel):
    newWordOrdering: str
