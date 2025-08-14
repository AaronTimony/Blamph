from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.word import Word
from app.models.deck import Deck
from app.models.wordDeck import WordDeck

router = APIRouter()

@router.post("/add/{word_text}/{deck_name}")
def add_word_to_deck(word_text: str, deck_name: str, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.deck_name == deck_name).first()
    if not deck:
        raise HTTPException(status_code = 404, detail="Deck does not exist")

    word = db.query(Word).filter(Word.word_text == word_text).first()
    if not word:
        word = Word(word_text = word_text)
        db.add(word)
        db.commit()
        db.refresh(word)

    existing = db.query(WordDeck).filter(
        WordDeck.word_id == word.id,
        WordDeck.deck_id == deck.id
    ).first()
    if existing:
        raise HTTPException(status_code = 409, detail="This word is already in this Deck")

    word_deck = WordDeck(word_id=word.id, deck_id=deck.id)
    db.add(word_deck)
    db.commit()

    return {"message": "Success"}


