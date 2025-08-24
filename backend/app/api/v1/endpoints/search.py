from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Card

router = APIRouter()

@router.get("/words")
def search_saved_words(query: str = Query(..., max_length=50), db: Session = Depends(get_db)):
    results = db.query(Card).filter(
        or_(
            Card.jp_word.contains(query),
            func.lower(Card.meaning).contains(func.lower(query))
        )
    ).all()

    return results
