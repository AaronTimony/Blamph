from pydantic import BaseModel

class UpdateNewWordsRequest(BaseModel):
    newDailyWords: int
