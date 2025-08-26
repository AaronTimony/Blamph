from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.services.srs import SRS
from app.models import User, UserCard, Card
from app.schemas.review import Newest_cards, Review_cards, CardRatingRequest, CardCountsResponse

router = APIRouter()
srs = SRS()

@router.get("/newcards", response_model = Newest_cards)
def get_users_newest_card(current_user: User = Depends(get_current_active_user),
                          db: Session = Depends(get_db)):
    """Code here is a bit weird, when I don't find a card, I want to run this again until i do find one. I created a max_attempts, meaning if 100 words are cycled through with no new word we give up. If we already have a word in users database, we go again to try find new one."""

    offset = 0
    max_attempts = 100

    while offset < max_attempts:
        card_tuple = srs.get_newest_card(current_user.id, db, offset)
        
        if card_tuple:
            return Newest_cards(
                jp_word = card_tuple[0],
                meaning = card_tuple[1],
                reading = card_tuple[2]
            )
        offset += 1

    raise HTTPEXception(status_code=404, detail="Could not find no card after 100 attemps")



@router.get("/reviewcards", response_model = Review_cards)
def get_users_review_cards(current_user: User = Depends(get_current_active_user),
                           db: Session = Depends(get_db)):
    user_due_card = srs.get_due_cards(current_user.id, db)
    if not user_due_card:
        return Review_cards(jp_word=None, meaning=None, reading=None)

    return Review_cards(
        jp_word=user_due_card[0],
        meaning=user_due_card[1],
        reading=user_due_card[2]
    )

@router.post("/newcardrating")
def get_users_new_card_rating(req: CardRatingRequest,
                              current_user: User = Depends(get_current_active_user),
                              db: Session = Depends(get_db)):
    card_id = db.query(Card.id).filter(Card.jp_word == req.jp_word).scalar()

    if not card_id:
        raise HTTPException(status_code=404, detail="Card not found")

    """I think i can get rid of this, already checked if user has card when getting it right?"""
    cur_card = (db.query(UserCard)
                 .filter(UserCard.user_id == current_user.id)
                 .filter(UserCard.card_id == card_id)
                 .first())

    if cur_card:
        raise HTTPException(status_code=404, detail="User already has card, not new")

    level, next_review, known = srs.calculate_next_review(0, req.rating, True)

    new_user_card = UserCard(card_id = card_id,
                             user_id = current_user.id,
                             level = level,
                             next_review = next_review,
                             known = known)
    db.add(new_user_card)
    db.commit()

@router.patch("/reviewcardrating")
def get_users_review_card_rating(req: CardRatingRequest,
                                 current_user: User = Depends(get_current_active_user),
                                 db: Session = Depends(get_db)):
    card_id = db.query(Card.id).filter(Card.jp_word == req.jp_word).scalar()
    if not card_id:
        raise HTTPException(status_code=404, detail="Card not found")

    cur_card = (db.query(UserCard)
                 .filter(UserCard.user_id == current_user.id)
                 .filter(UserCard.card_id == card_id)
                 .first())

    if not cur_card:
        raise HTTPException(status_code=404, detail="Could not find user's card")

    new_level, next_review, known = srs.calculate_next_review(cur_card.level, req.rating, False)

    cur_card.level = new_level
    cur_card.next_review = next_review
    cur_card.known = known

    db.commit()
    db.refresh(cur_card)

@router.get("/AllCardCounts", response_model = CardCountsResponse)
def get_number_of_cards(current_user: User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):

    new_count = srs.get_new_cards_count(current_user.id, db)
    due_count = srs.get_due_cards_count(current_user.id, db)
    known_count = srs.get_known_cards_count(current_user.id, db)

    return CardCountsResponse(
        due_count=due_count,
        new_count=new_count,
        known_count=known_count
    )
