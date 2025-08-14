from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.deck import Deck
from app.models.user import User
from app.models.userDeck import UserDeck
from app.schemas.decks import DeckAdd, DeleteDeck
router = APIRouter()

@router.get("/")
def get_decks():
    return FetchTopAnime()

@router.post("/create/{deck_name}/")
def create_deck(deck_name: str, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.deck_name == deck_name).first()
    if deck:
        raise HTTPException(status_code = 409, detail="Deck already exists")

    new_deck = Deck(deck_name=deck_name)
    db.add(new_deck)
    db.commit()

    return {"message": "deck added to the database"}

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
    print(f"received deck: {deck.deck_name}")
    user = current_user
    print(f"found user: {user.id}")
    deck_exist = db.query(Deck).filter(Deck.deck_name == deck.deck_name).first()
    if not deck_exist:
        print("Creating new deck")
        new_deck = Deck(image_url=deck.image_url,
                        deck_name=deck.deck_name)
        db.add(new_deck)
        db.commit()
        db.refresh(new_deck)
        deck_exist = new_deck
        print(f"{deck_exist.id}")

    existing = db.query(UserDeck).filter(
        UserDeck.user_id == user.id,
        UserDeck.deck_id == deck_exist.id
    ).first()

    if existing:
        raise HTTPException(status_code = 409, detail="User already has this deck")

    user_deck = UserDeck(user_id=user.id, deck_id=deck_exist.id)
    db.add(user_deck)
    db.commit()

    return {"message": "Deck added to user successfully"}

@router.get("/myDecks")
def get_users_decks(current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    return db.query(Deck).join(UserDeck).filter(UserDeck.user_id == current_user.id).all()
