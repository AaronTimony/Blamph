from sqlalchemy.orm import relationship
from sqlalchemy import Integer, String, Column, ForeignKey
from app.core.database import Base
from app.models import Card, Deck

class CardDeck(Base):
    __tablename__ = "card_deck"

    card_id = Column(Integer, ForeignKey("cards.id"), primary_key = True)
    deck_id = Column(Integer, ForeignKey("decks.id"), primary_key = True)
    word_frequency = Column(Integer)

    card = relationship("Card", back_populates="deck_associations")
    deck = relationship("Deck", back_populates="card_associations")
