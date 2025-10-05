from fastapi import APIRouter, Depends, Query
from sqlalchemy import cast, String, func, or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Card, Deck, CardDeck, User, UserCard
from app.api.v1.endpoints.auth import get_current_active_user
from app.schemas.search import NewWordPriorityRequest
import json

router = APIRouter()

@router.get("/words/")
def search_saved_words(query: str = Query(..., max_length=50), db: Session = Depends(get_db)):
    if not query:
        return []

    # This is a bit werid but because there is a lot of meanings I am for now just getting the first meaning in the list.
    card_query = db.query(Card.id).filter(
        or_(
            Card.jp_word.contains(query),
            func.lower(cast(Card.meaning[0], String)).contains(func.lower(query))
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

    # Note: Hardcoding search results to limit at 50 results
    results_limit = 50

    cards = db.query(subq).filter(subq.c.id.in_(card_ids)).limit(results_limit).all()

    return [{"card_id": card.id, "jp_word" : card.jp_word, "meaning" : card.meaning, "overall_frequency":card.overall_frequency, "rank" : card.rank} for card in cards]

@router.get("/deckWords/")
def search_deck_words(query: str = Query(..., max_length = 50),
                      deck_name: str = Query(..., max_length = 200),
                      db: Session = Depends(get_db)):
    if not query:
        return []

    rank = func.rank().over(order_by=Card.overall_frequency.desc())

    subq = (db.query(
        Card.id,
        Card.jp_word,
        Card.meaning,
        Card.overall_frequency,
        rank.label("rank")
    ).subquery())

    cards = (db.query(subq.c.id,
                           subq.c.jp_word,
                           subq.c.meaning,
                           subq.c.overall_frequency,
                           subq.c.rank,
                           CardDeck.word_frequency,
                      )\
                  .join(CardDeck, subq.c.id == CardDeck.card_id)
                  .join(Deck, Deck.id == CardDeck.deck_id)
             .filter(Deck.deck_name == deck_name,
                     or_(
                     subq.c.jp_word.contains(query),
                     func.lower(subq.c.meaning).contains(func.lower(query))
                  ))
                  .limit(50)
                  .all())

    # Note: Hardcoding search results to limit at 50 results


    return [{"jp_word" : card.jp_word, "meaning" : card.meaning, "overall_frequency":card.overall_frequency, "word_frequency": card.word_frequency,  "overall_rank": card.rank} for card in cards]

@router.patch("/addWordPriority/")
def add_word_to_priority_queue(request: NewWordPriorityRequest,
                               current_user: User = Depends(get_current_active_user),
                               db: Session = Depends(get_db)):

    card_id = request.card_id

    card_exist = (db.query(UserCard.card_id)
                 .filter(UserCard.user_id == current_user.id)
                 .filter(UserCard.card_id == card_id)
                 .first())

    if card_exist:
        return {"message": "Card already in your review queue"}

    if card_id not in current_user.new_word_priority_queue:
        updated_queue = current_user.new_word_priority_queue + [card_id]
        db.query(User).filter(User.id == current_user.id).update({User.new_word_priority_queue: json.dumps(updated_queue) })
        print(f"Added {card_id}. Queue is now: {current_user.new_word_priority_queue}")
    else:
        print(f"Card {card_id} already in queue")


    db.commit()

    return {"message" : "Added to priority queue", "queue" : current_user.new_word_priority_queue}
