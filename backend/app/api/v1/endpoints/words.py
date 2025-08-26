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

router = APIRouter()
parser = SubtitleParser()

@router.post("/addSubs")
async def assign_words_to_deck(deck_name: str = Form(...), files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    supported_extensions = ('.srt',)

    deck = db.query(Deck).filter(Deck.deck_name == deck_name).first()
    for file in files:
        if not file.filename.lower().endswith(supported_extensions):
            raise HTTPException(status_code=400, detail="This file type is not supported)")

        if not deck:
            raise HTTPException(status_code=404, detail=f"Deck '{deck_name}' not found")
        try:
            content = await file.read()

            result = parser.parse_srt_file(content, deck.id, db)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not add subtitles: {e}")

    unique_words = db.query(CardDeck).filter(CardDeck.deck_id == deck.id).count()
    total_words = db.query(func.sum(CardDeck.word_frequency)).filter(CardDeck.deck_id == deck.id).scalar()

    deck.total_words = total_words
    deck.unique_words = unique_words
    db.commit()
    db.refresh(deck)

    return {
    "message": "successfully added",
    "deck_id": deck.id,
    "unique_words": total_words
}

@router.get("/getWords")
def get_users_words(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):

    users_cards = db.query(CardDeck).join(UserDeck, CardDeck.deck_id == UserDeck.deck_id).filter(UserDeck.user_id == current_user.id).distinct().all()

    for user_card in users_cards:
        card_already_added = db.query(UserCard).filter(UserCard.user_id == current_user.id).filter(UserCard.card_id == user_card.card_id).first()

        if not card_already_added:
            new_user_card = UserCard(user_id=current_user.id,
                                     card_id=user_card.card_id,
                                     known=False,
                                     level=0,
                                     next_review=datetime.now())
            db.add(new_user_card)
    db.commit()

    user_cards = db.query(Card).join(UserCard, UserCard.card_id == Card.id).filter(UserCard.user_id == current_user.id).all()

    return user_cards
