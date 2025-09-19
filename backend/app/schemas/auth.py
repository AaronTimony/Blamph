from pydantic import EmailStr, BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: str

class TokenData(BaseModel):
    username: str or None = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenData(BaseModel):
    username: str
    created_at: str
    token_type: str = "refresh"
    
class User(BaseModel):
    username: str
    email: str or None = None
    profile_picture: str


class UserInDB(User):
    hashed_password: str


