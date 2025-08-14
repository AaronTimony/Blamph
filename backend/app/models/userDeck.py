from app.core.database import Base
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models import User, Deck 

class UserDeck(Base):
    __tablename__ = "user_decks"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key = True) 
    deck_id = Column(Integer, ForeignKey("decks.id"), primary_key = True)
    
    user = relationship("User", back_populates="deck_associations")
    deck = relationship("Deck", back_populates="user_associations")
