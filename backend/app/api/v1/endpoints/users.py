from fastapi import APIRouter, Depends, HTTPException
from app.schemas.users import UserCreate
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models import Card, User, Deck, UserDeck, CardDeck
from passlib.context import CryptContext
from app.services.user_services import UserService
router = APIRouter()
user_service = UserService()

@router.post("/register/")
def register_user(user:UserCreate, db: Session = Depends(get_db)):
    return user_service.register_user_service(user.password, user.username, user.full_name, user.email, db)

