from sqlalchemy.orm import relationship
from sqlalchemy import Integer, String, Column, ForeignKey, Boolean
from app.core.database import Base

class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key = True)
    deck_name = Column(String, nullable = False)
    image_url = Column(String, nullable = True)
    total_words = Column(Integer)
    unique_words = Column(Integer)
    user_created = Column(Boolean)
    
    card_associations = relationship("CardDeck", back_populates="deck")
    user_associations = relationship("UserDeck", back_populates="deck")
