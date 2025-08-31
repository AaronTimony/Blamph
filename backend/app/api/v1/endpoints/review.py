from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models import User, UserCard, Card
from app.schemas.review import Newest_cards, Review_cards, CardRatingRequest, CardCountsResponse
from app.services.review_service import ReviewService

router = APIRouter()
review_service = ReviewService()

@router.get("/newcards", response_model = Newest_cards)
def get_users_newest_card(current_user: User = Depends(get_current_active_user),
                          db: Session = Depends(get_db)):
    return review_service.get_newest_card(current_user, db)

@router.get("/reviewcards", response_model = Review_cards)
def get_users_review_cards(current_user: User = Depends(get_current_active_user),
                           db: Session = Depends(get_db)):
    return review_service.get_review_card(current_user, db)

@router.post("/newcardrating")
def get_users_new_card_rating(req: CardRatingRequest,
                              current_user: User = Depends(get_current_active_user),
                              db: Session = Depends(get_db)):
    return review_service.new_card_rating(req, current_user, db)

@router.patch("/reviewcardrating")
def get_users_review_card_rating(req: CardRatingRequest,
                                 current_user: User = Depends(get_current_active_user),
                                 db: Session = Depends(get_db)):

    return review_service.review_card_rating(req, current_user, db)

@router.get("/AllCardCounts", response_model = CardCountsResponse)
def get_number_of_cards(current_user: User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):

    return review_service.get_card_counts(current_user, db)
