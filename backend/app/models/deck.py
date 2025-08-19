from sqlalchemy.orm import relationship
from sqlalchemy import Integer, String, Column, ForeignKey
from app.core.database import Base

class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key = True)
    deck_name = Column(String, nullable = False)
    image_url = Column(String)
    total_words = Column(Integer)
    unique_words = Column(Integer)
    
    word_associations = relationship("WordDeck", back_populates="deck")
    user_associations = relationship("UserDeck", back_populates="deck")
