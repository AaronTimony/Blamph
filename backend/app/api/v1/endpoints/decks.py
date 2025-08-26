from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import Deck, User, UserDeck, UserCard
from app.schemas.decks import DeckAdd, DeleteDeck, CreateDeck
from typing import List
router = APIRouter()

@router.get("/")
def get_decks(db: Session = Depends(get_db)):
    return db.query(Deck).all()

@router.post("/create/")
def create_deck(decks: List[CreateDeck],
                db: Session = Depends(get_db)):
    for deck in decks:

        deck_exist = db.query(Deck).filter(Deck.deck_name == deck.deck_name).first()
        if deck_exist:
            continue

        new_deck = Deck(deck_name=deck.deck_name, image_url=deck.image_url)
        db.add(new_deck)
    db.commit()

    return {"message": "deck added to the database"}


@router.get("/search/")
def search_decks(q: str = Query(..., max_length = 50),
                 db: Session = Depends(get_db)):
    results = db.query(Deck).filter(func.lower(Deck.deck_name).contains(func.lower(q))).all()
    return results

@router.get("/search/myDecks")
def search_decks(q: str = Query(..., max_length = 50),
                 current_user: str = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    results = (db.query(Deck).join(UserDeck, UserDeck.deck_id == Deck.id)
    .filter(UserDeck.user_id == current_user.id)
    .filter(func.lower(Deck.deck_name).contains(func.lower(q))).all())
    return results

@router.delete("/delete/")
def delete_a_users_deck(delDeck: DeleteDeck,
                        current_user: str = Depends(get_current_active_user),
                        db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.deck_name == delDeck.deck_name).first()
    if not deck:
        raise HTTPException(status_code=404, detail="This deck does not exist")

    existing = db.query(UserDeck).filter(
        UserDeck.user_id == current_user.id,
        UserDeck.deck_id == deck.id
    ).first()

    if not existing:
        raise HTTPException(status_code = 404, detail="User does not have this deck added")


    db.delete(existing)
    db.commit()

    return {"message" : "Deck has been removed from user"}

@router.post("/AddDeck")
def add_deck_to_user(deck: DeckAdd,
                     current_user: User = Depends(get_current_active_user),
                     db: Session =  Depends(get_db)):
    user = current_user
    deck_exist = db.query(Deck).filter(Deck.deck_name == deck.deck_name).first()
    if not deck_exist:
        new_deck = Deck(image_url=deck.image_url,
                        deck_name=deck.deck_name)
        db.add(new_deck)
        db.commit()
        db.refresh(new_deck)
        deck_exist = new_deck

    existing = db.query(UserDeck).filter(
        UserDeck.user_id == user.id,
        UserDeck.deck_id == deck_exist.id
    ).first()

    if existing:
        raise HTTPException(status_code = 409, detail="User already has this deck")

    # Excludes cards that the user already has

    user_deck = UserDeck(user_id=user.id, deck_id=deck_exist.id)
    db.add(user_deck)
    db.commit()

    return {"message": "Deck added to user successfully"}

@router.get("/myDecks")
def get_users_decks(current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    return db.query(Deck).join(UserDeck).filter(UserDeck.user_id == current_user.id).all()
