from fastapi import APIRouter, HTTPException, Header, Depends, UploadFile, File, Form
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.services.subtitle_parser import SubtitleParser
from typing import Optional, List
import requests
import base64
from app.models import Deck, CardDeck
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

