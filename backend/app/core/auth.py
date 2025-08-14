from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from app.schemas.auth import UserInDB, TokenData
from app.core.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="token") 
# This will check the headers from the request and check authorization header
# Then it will use the token passed in authorisation header is of Bearer <token>

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta or None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM) # jwt.encode knows to look for "exp" in the data and use that as the expiretime
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth_2_scheme),
                           db: Session = Depends(get_db)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]) # if fails returns JWTError 
        username: str = payload.get("sub") # Even if decodes, you need to check
        # if the username is even present
        if username is None:
            raise credential_exception

        token_data = TokenData(username=username) # Pydantic model
    except JWTError as e:
        print(f"JWT decode error: {e}")
        raise credential_exception

    user = get_user(db, username=token_data.username) # This gets the actual user
    # from the database the above. It could be the case that alice logged in 
    # then admin removed alice but token is still valid, however this is invalid
    # as user no longer will exist in database. So alice can no longer make request,
    # even though she has a valid token.
    if user is None:
        raise credential_exception

    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):

    return current_user
