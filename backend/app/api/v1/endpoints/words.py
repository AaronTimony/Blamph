from fastapi import APIRouter, HTTPException, Header, Depends, UploadFile, File, Form
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.services.subtitle_parser import SubtitleParser
from typing import Optional, List
from datetime import datetime
import requests
import base64
from app.models import Deck, CardDeck, UserDeck, UserCard, User, Card
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.services.word_services import WordService

router = APIRouter()
word_service = WordService()

@router.post("/addSubs")
async def assign_words_to_deck(deck_name: str = Form(...),
                               files: List[UploadFile] = File(...),
                               current_user: User = Depends(get_current_active_user),
                               db: Session = Depends(get_db)):
    return await word_service.assign_cards_to_deck(deck_name, files, db, current_user.id)

@router.get("/getWords")
def get_users_words(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return word_service.get_user_words(current_user, db)
