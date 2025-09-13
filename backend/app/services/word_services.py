from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import UploadFile, HTTPException
from app.services.subtitle_parser import SubtitleParser
from app.models import Deck, CardDeck, User, UserCard, Card, UserDeck

parser = SubtitleParser()

class WordService:
    async def assign_cards_to_deck(self, deck_name: str, files: List[UploadFile], db: Session, user_id: int):
        supported_extensions = ('.srt',)

        deck = db.query(Deck).filter(Deck.deck_name == deck_name).first()
        for file in files:
            if not file.filename.lower().endswith(supported_extensions):
                raise HTTPException(status_code=400, detail="This file type is not supported)")

            if not deck:
                deck = Deck(deck_name = deck_name, user_created = True)
                db.add(deck)
                db.commit()
                db.refresh(deck)

                add_to_user = UserDeck(deck_id = deck.id, user_id = user_id, deck_order = 1)
                db.query(UserDeck).filter(UserDeck.user_id == user_id).update({UserDeck.deck_order: UserDeck.deck_order + 1})
                db.add(add_to_user)
                db.commit()
                db.refresh(add_to_user)

            try:
                content = await file.read()

                result = parser.parse_srt_file(content, deck.id, db)

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Could not add subtitles: {e}")

        unique_words = db.query(CardDeck).filter(CardDeck.deck_id == deck.id).count()
        total_words = db.query(func.sum(CardDeck.word_frequency)).filter(CardDeck.deck_id == deck.id).scalar()

        deck.total_words = total_words
        deck.unique_words = unique_words
        db.commit()
        db.refresh(deck)

        return {
        "message": "successfully added",
        "deck_id": deck.id,
        "unique_words": total_words
    }

    def get_user_words(self, current_user: User, db: Session):

        user_cards = db.query(UserCard.card_id).filter(current_user.id == UserCard.user_id).all()

        if not user_cards:
            raise HTTPException(status_code=404, detail="Could not find any words for this user.")

        user_cards_ids = [card.card_id for card in user_cards]

        rank = func.rank().over(order_by=Card.overall_frequency.desc())

        # Subquery necessary as sql will perform a where before an order_by
        # so if we want to get overall frequencies in global order we need a subquery
        subq = (
            db.query(
                Card.id,
                Card.jp_word,
                Card.meaning,
                Card.overall_frequency,
                rank.label("rank")
            ).subquery()
        )

        cards = db.query(subq).filter(subq.c.id.in_(user_cards_ids)).all()

        return [{"jp_word" : card.jp_word, "meaning" : card.meaning, "overall_frequency" : card.overall_frequency, "rank": card.rank} for card in cards]
