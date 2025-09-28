from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import UploadFile, HTTPException
from app.services.subtitle_parser import SubtitleParser
from app.models import Deck, CardDeck, User, UserCard, Card, UserDeck
from app.schemas.words import DeckWordsReq
import math

parser = SubtitleParser()

class WordService:
    async def assign_cards_to_deck(self, deck_name: str, files: List[UploadFile], db: Session, user_id: int):
        supported_extensions = ('.srt',)

        deck = db.query(Deck).filter(Deck.deck_name == deck_name).first()

        if not deck:
            new_deck = Deck(deck_name = deck_name, user_created = True)
            db.add(new_deck)
            db.flush()

            add_to_user = UserDeck(deck_id = new_deck.id, user_id = user_id, deck_order = 1)
            db.query(UserDeck).filter(UserDeck.user_id == user_id).update({UserDeck.deck_order: UserDeck.deck_order + 1})
            db.add(add_to_user)
            db.commit()

            deck = new_deck

        for file in files:
            if not file.filename.lower().endswith(supported_extensions):
                raise HTTPException(status_code=400, detail="This file type is not supported)")

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

    def get_decks_words(self,
                        deck_name: str,
                        current_user: User,
                        db: Session,
                        ordering: str,
                        page: int = 1,
                        limit: int = 100):
        rank = func.rank().over(order_by=Card.overall_frequency.desc())

        offset = (page - 1) * limit

        rank_subq = (
            db.query(
                Card.id,
                rank.label("rank")
            ).subquery()
        )

        if ordering == "deck_frequency":
            order_method = CardDeck.word_frequency.desc()
        elif ordering == "global_frequency":
            order_method = rank_subq.c.rank.asc()
        else:
            order_method = CardDeck.id.asc()

        if current_user:
            cards = (db.query(Deck.deck_name,
                              Card.id,
                              CardDeck.word_frequency,
                              Card.jp_word,
                              Card.meaning,
                              UserCard.known,
                              UserCard.level,
                              Deck.unique_words,
                              rank_subq.c.rank)
                     .join(CardDeck, Deck.id == CardDeck.deck_id)
                     .join(Card, Card.id == CardDeck.card_id)
                     .join(rank_subq, rank_subq.c.id == Card.id)
                     .outerjoin(UserCard, (UserCard.card_id == Card.id) & (UserCard.user_id == current_user.id))
                     .filter(Deck.deck_name == deck_name)
                     .order_by(order_method)
                     .limit(limit)
                     .offset(offset)
                     .all())

            total_pages = 0 if not cards else (math.ceil(cards[0].unique_words/limit))

            return [
                {
                    "deck_name" : card.deck_name,
                    "word_frequency" : card.word_frequency,
                    "jp_word" : card.jp_word,
                    "meaning" : card.meaning,
                    "overall_rank": card.rank,
                    "known": card.known if card.known is not None else False,
                    "level": card.level if card.level is not None else 0,
                    "page": page,
                    "limit": limit,
                    "total_pages": total_pages
                }
                for card in cards
            ]

        else:
            cards = (db.query(Deck.deck_name,
                              CardDeck.word_frequency,
                              Card.jp_word,
                              Card.meaning,
                              Card.overall_frequency
                              )
                     .join(CardDeck, Deck.id == CardDeck.deck_id)
                     .join(Card, Card.id == CardDeck.card_id)
                     .join(rank_subq, rank_subq.c.id == Card.id)
                     .filter(Deck.deck_name == deck_name)
                     .all())

            return [
                {
                    "deck_name" : card.deck_name,
                    "word_frequency" : card.word_frequency,
                    "jp_word" : card.jp_word,
                    "meaning" : card.meaning,
                    "overall_frequency": card.overall_frequency
                }
                for card in cards
            ]
