from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str]
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    username: str

    class Config:
        from_attributes = True

