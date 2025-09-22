from sqlalchemy.orm import relationship
from sqlalchemy import Integer, String, Column, ForeignKey, UniqueConstraint
from app.core.database import Base
from app.models import Card, Deck

class CardDeck(Base):
    __tablename__ = "card_deck"

    id = Column(Integer, primary_key = True, autoincrement=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    deck_id = Column(Integer, ForeignKey("decks.id"))
    word_frequency = Column(Integer)

    __table_args__ = (UniqueConstraint('card_id', 'deck_id'),)

    card = relationship("Card", back_populates="deck_associations")
    deck = relationship("Deck", back_populates="card_associations")
