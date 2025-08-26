from app.core.database import Base
from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

class UserCard(Base):
    __tablename__ = "user_cards"

    card_id = Column(Integer, ForeignKey("cards.id"), primary_key = True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key = True)
    known = Column(Boolean, default=False)
    level = Column(Integer, default=0)
    next_review = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="cards")
    card = relationship("Card", back_populates="user_relationship")
