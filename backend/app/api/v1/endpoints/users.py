from fastapi import APIRouter, Depends, HTTPException
from app.schemas.users import UserCreate, UserResponse
from typing import List
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User

router = APIRouter()

@router.post("/register/", response_model=UserResponse)
def register_user(user:UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        username=user.username,
        email=user.email,
        password=user.password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.get("/", response_model=List[str])
def get_users(db: Session = Depends(get_db)):
    usernames = db.query(User.username).all()

    return [username[0] for username in usernames]

