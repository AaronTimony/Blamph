from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import Deck, User, UserDeck, UserCard
from app.schemas.decks import DeckAdd, DeleteDeck, CreateDeck, MyDecksResponse, DeckOrderRequest, DeckReorder
from app.services.deck_services import DeckService
from typing import List
router = APIRouter()
decks_service = DeckService()

@router.get("/")
def get_decks(db: Session = Depends(get_db)):

    return db.query(Deck).filter(Deck.user_created == False).all()

@router.post("/create/")
def create_deck(decks: List[CreateDeck],
                db: Session = Depends(get_db)):
    return decks_service.create_deck(decks, db)

@router.get("/search/")
def search_decks(q: str = Query(..., max_length = 50),
                 db: Session = Depends(get_db)):
    results = db.query(Deck).filter(func.lower(Deck.deck_name).contains(func.lower(q))).all()
    return results

@router.get("/search/myDecks")
def search_decks(q: str = Query(..., max_length = 50),
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    results = (db.query(Deck).join(UserDeck, UserDeck.deck_id == Deck.id)
    .filter(UserDeck.user_id == current_user.id)
    .filter(func.lower(Deck.deck_name).contains(func.lower(q))).all())
    return results

@router.delete("/delete/")
def delete_a_users_deck(delDeck: DeleteDeck,
                        current_user: User = Depends(get_current_active_user),
                        db: Session = Depends(get_db)):
    return decks_service.delete_deck(delDeck, current_user, db)

@router.post("/AddDeck")
def add_deck_to_user(deck: DeckAdd,
                     current_user: User = Depends(get_current_active_user),
                     db: Session =  Depends(get_db)):

    return decks_service.add_user_deck(deck, current_user, db)

@router.get("/myDecks")
def get_users_decks(current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):

    return decks_service.extract_user_decks(current_user, db)

@router.put("/reorder")
async def reorder_users_decks(request: DeckOrderRequest,
                        current_user: User = Depends(get_current_active_user),
                        db: Session = Depends(get_db)):

    return await decks_service.reorder_decks(request, current_user, db)

@router.get("/known_percent")
def get_users_deck_known_percentage(current_user: User = 
                                    Depends(get_current_active_user),
                                    db: Session = Depends(get_db)):
    return decks_service.deck_known_percentage(current_user, db)
