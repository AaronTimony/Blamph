from sqlalchemy.orm import Session 
from sqlalchemy import func
from fastapi import Depends, HTTPException
from typing import List
from app.models import Deck, UserDeck, User, CardDeck, UserCard
from app.schemas.decks import CreateDeck, DeleteDeck, DeckAdd, DeckOrderRequest

class DeckService:
    def create_deck(self, decks: List[CreateDeck], db: Session):
        for deck in decks:

            deck_exist = db.query(Deck).filter(Deck.deck_name == deck.deck_name).first()
            if deck_exist:
                continue

            new_deck = Deck(deck_name=deck.deck_name, image_url=deck.image_url, user_created = False)
            db.add(new_deck)
        db.commit()

        return {"message": "decks added to the database"}

    def delete_deck(self, delDeck: DeleteDeck, current_user: User, db: Session):

        deck = db.query(Deck).filter(Deck.deck_name == delDeck.deck_name).first()
        if not deck:
            raise HTTPException(status_code=404, detail="This deck does not exist")

        existing = db.query(UserDeck).filter(
            UserDeck.user_id == current_user.id,
            UserDeck.deck_id == deck.id
        ).first()

        if not existing:
            raise HTTPException(status_code = 404, detail="User does not have this deck added")

        db.query(UserDeck).filter(UserDeck.user_id == current_user.id).filter(UserDeck.deck_order > delDeck.deck_order).update({UserDeck.deck_order: UserDeck.deck_order - 1})

        db.delete(existing)
        db.commit()

        return {"message" : "Deck has been removed from user"}

    def add_user_deck(self, deck: DeckAdd, current_user: User, db: Session):
        deck_exist = db.query(Deck).filter(Deck.deck_name == deck.deck_name).first()
        if not deck_exist:
            new_deck = Deck(image_url=deck.image_url,
                            deck_name=deck.deck_name)
            db.add(new_deck)
            db.commit()
            db.refresh(new_deck)
            deck_exist = new_deck


        existing = db.query(UserDeck).filter(
            UserDeck.user_id == current_user.id,
            UserDeck.deck_id == deck_exist.id
        ).first()

        if existing:
            raise HTTPException(status_code = 409, detail="User already has this deck")

        # Excludes cards that the user already has
        # Now we will move all of a users decks up before adding the new deck with rank 1.

        db.query(UserDeck).filter(UserDeck.user_id == current_user.id).update({UserDeck.deck_order: UserDeck.deck_order + 1})

        user_deck = UserDeck(user_id=current_user.id, deck_id=deck_exist.id, deck_order = 1)
        db.add(user_deck)
        db.commit()

        return {"message": "Deck added to user successfully"}

    def extract_user_decks(self, current_user: User, db: Session):

        decks = (db.query(Deck, UserDeck.deck_order)
        .join(UserDeck).filter(UserDeck.user_id == current_user.id)
        .order_by(UserDeck.deck_order).all())
        decks_list = []

        for deck, deck_order in decks:
            deck_data = {
                "deck_name" : deck.deck_name,
                "image_url" : deck.image_url,
                "unique_words" : deck.unique_words,
                "total_words" : deck.total_words,
                "deck_order" : deck_order
            }

            decks_list.append(deck_data)

        return decks_list

    async def reorder_decks(self, request: DeckOrderRequest,
                      current_user: User,
                      db: Session):
        try:
            for deck_update in request.deckOrders:
                deck_name = deck_update.deck_name
                deck_order = deck_update.deck_order
                deck_id = db.query(Deck.id).filter(Deck.deck_name == deck_name).scalar()

                db.query(UserDeck)\
                .filter(UserDeck.deck_id == deck_id)\
                .filter(UserDeck.user_id == current_user.id)\
                .update({UserDeck.deck_order: deck_order})

            db.commit()

        except Exception as e:
            print(f"Could not update decks", e)

    def deck_known_percentage(self, current_user: User, db: Session):
        decks = db.query(Deck).filter(Deck.user_created == False).all()

        known_per = []
        for deck in decks:
            known_words = db.query(func.sum(CardDeck.word_frequency))\
            .join(UserCard, UserCard.card_id == CardDeck.card_id)\
            .filter(CardDeck.deck_id == deck.id)\
            .filter(UserCard.user_id == current_user.id)\
            .filter(UserCard.known == True)\
            .scalar() or 0 # If no cards are known

            known_words_percentage = (
                known_words / deck.total_words if deck.total_words else 0
            )


            deck_per = {
                "deck_name" : deck.deck_name,
                "known_per" : known_words_percentage
            }

            known_per.append(deck_per)

        return known_per


