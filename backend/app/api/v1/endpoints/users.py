from fastapi import APIRouter, Depends, HTTPException
from app.schemas.users import UserCreate, UserResponse
from typing import List
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models import Card, User, Deck, UserDeck, CardDeck
from passlib.context import CryptContext
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.auth import get_password_hash
router = APIRouter()

@router.post("/register/", response_model=UserResponse)
def register_user(user:UserCreate, db: Session = Depends(get_db)):
    hashed_pw = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        password=hashed_pw,
        full_name=user.full_name,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.get("/", response_model=List[str])
def get_users(db: Session = Depends(get_db)):
    usernames = db.query(User.username).all()

    return [username[0] for username in usernames]

@router.get("/words", response_model=List[str])
def get_users_words(username:str,
                    current_user: str = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    user = current_user

    words = db.query(Card).join(CardDeck, Card.id == CardDeck.word_id)\
            .join(Deck, Deck.id == CardDeck.deck_id)\
            .join(UserDeck, Deck.id == UserDeck.deck_id)\
            .filter(UserDeck.user_id == user.id).all()

    word_list =  [word.word_text for word in words]

    return word_list
