from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Card

router = APIRouter()

@router.get("/words")
def search_saved_words(query: str = Query(..., max_length=50), db: Session = Depends(get_db)):
    if not query:
        return []
    card_query = db.query(Card.id).filter(
        or_(
            Card.jp_word.contains(query),
            func.lower(Card.meaning).contains(func.lower(query))
        )
    ).all()

    card_ids = [card.id for card in card_query]

    rank = func.rank().over(order_by=Card.overall_frequency.desc())

    subq = (
        db.query(
            Card.id,
            Card.jp_word,
            Card.meaning,
            Card.overall_frequency,
            rank.label("rank")
        ).subquery()
    )

    cards = db.query(subq).filter(subq.c.id.in_(card_ids)).all()

    return [{"jp_word" : card.jp_word, "meaning" : card.meaning, "overall_frequency":card.overall_frequency, "rank" : card.rank} for card in cards]
