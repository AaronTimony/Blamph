from app.core.database import Base
from sqlalchemy import Integer, Column, ForeignKey, String, JSON
from sqlalchemy.orm import relationship

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key= True)
    jp_word = Column(String, nullable = False)
    reading = Column(String, nullable = True)
    meaning = Column(JSON, nullable = True)
    image = Column(String, nullable = True)
    overall_frequency = Column(Integer, default=0)

    deck_associations = relationship("CardDeck", back_populates="card")
    user_relationship = relationship("UserCard", back_populates="card")
