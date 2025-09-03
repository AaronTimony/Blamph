from app.core.auth import *
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.config import settings
from app.schemas.auth import User, Token, TokenResponse, RefreshTokenRequest
from app.schemas.decks import DeckResponse
from app.core.database import get_db

router = APIRouter()
@router.post("/login", response_model=TokenResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                                 db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub":user.username})

    refresh_token = create_refresh_token(user.username)

    return {
        "access_token": access_token,
        "refresh_token":refresh_token,
        "token_type": "bearer",
        "user": form_data.username
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    user = verify_refresh_token(request.refresh_token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


    revoke_refresh_token(request.refresh_token)
    # Create new tokens
    token =  create_access_token(data={"sub": user.username})
    new_refresh_token = create_refresh_token(user.username)
    return {"access_token": token, "token_type": "bearer",
            "refresh_token" : new_refresh_token, "user": user.username}

@router.post("/logout")
async def logout(request: RefreshTokenRequest, current_user: User = Depends(get_current_active_user)):
    return revoke_refresh_token(request.refresh_token)

@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


