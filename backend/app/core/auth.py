from passlib.context import CryptContext
import redis
from fastapi import Depends, HTTPException, status
import secrets
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from app.schemas.auth import TokenData, RefreshTokenData
from app.core.config import settings
from app.models.user import User

redis_client = redis.Redis.from_url(settings.REDIS_URL)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# This will check the headers from the request and check authorization header
# Then it will use the token passed in authorisation header is of Bearer
# <token>


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

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY,
                             algorithm=settings.ALGORITHM)
    # jwt.encode knows to look for "exp" in the data and use that as the
    # expiretime
    print("Token received:", encoded_jwt)
    return encoded_jwt


def create_refresh_token(username: str) -> str:
    refresh_token = secrets.token_urlsafe(64)

    token_data = RefreshTokenData(username=username,
                                  created_at=datetime.now(timezone.utc).isoformat()
                                  )

    expire_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    redis_client.setex(
        f"refresh_token:{refresh_token}",
        expire_seconds,
        token_data.model_dump_json()
        # You can store anything you want in token_data
        # it is just a json attached to the token so anything that could be
        # useful you can input
   )
    # redis_client.bgsave()
    # No need to manually trigger to handle persistence anymore
    print("refresh_token", refresh_token)
    return refresh_token


def verify_refresh_token(token: str, db: Session) -> Optional[User]:
    try:
        token_data_json = redis_client.get(f"refresh_token:{token}")

        if not token_data_json:
            return None
        token_data = RefreshTokenData.model_validate_json(token_data_json)

        user = get_user(db, token_data.username)
        print("Works well!")
        return user
    except Exception as e:
        print(f"Refresh token verification error: {e}")
        return None


def revoke_refresh_token(token: str) -> bool:
    """This would be used in the case that you want to log out on one device,
    but not on the others"""
    try:
        result = redis_client.delete(f"refresh_token:{token}")
        return result > 0
    except Exception:
        return False


def revoke_all_user_refresh_tokens(username: str):
    """This is useful if someone gets a password of some sort and wants to log out on all of their devices. This function allows you to quickly do that. Not currently used but could be added for security if I wanted."""
    try:
        pattern = "refresh_token:*"
        keys = redis_client.keys(pattern)
        for key in keys:
            token_data_json = redis_client.get(key)
            if token_data_json:
                token_data = RefreshTokenData.model_validate_json(token_data_json)
                if token_data.username == username:
                    redis_client.delete(key)

    except Exception as e:
        print(f"Error in removing refresh token {e}")


async def get_current_user(token: str = Depends(oauth_2_scheme),
                           db: Session = Depends(get_db)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]) # if fails returns JWTError 
        username: str = payload.get("sub") # Even if decodes, you need to check
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
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

def check_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
