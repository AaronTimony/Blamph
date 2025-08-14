from app.core.auth import *
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.config import settings
from app.schemas.auth import User, Token
from app.schemas.decks import DeckResponse
from app.core.database import get_db

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                                 db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Username or Password", headers={"WWW-Authenticate": "Bearer"})

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username},expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}   

@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/users/me/decks", response_model=DeckResponse)
async def read_decks_me(current_user: User = Depends(get_current_active_user)):
    return [{"deck_name" : 1,"username": current_user}]

