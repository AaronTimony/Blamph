from sqlalchemy.orm import relationship
from sqlalchemy import Integer, String, Column, ForeignKey
from app.core.database import Base
from app.models import Word, Deck

class WordDeck(Base):
    __tablename__ = "word_deck"

    word_id = Column(Integer, ForeignKey("words.id"), primary_key = True)
    deck_id = Column(Integer, ForeignKey("decks.id"), primary_key = True)
    word_frequency = Column(Integer)

    word = relationship("Word", back_populates="deck_associations")
    deck = relationship("Deck", back_populates="word_associations")
