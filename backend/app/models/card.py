from app.core.database import Base
from sqlalchemy import Integer, Column, ForeignKey, String
from sqlalchemy.orm import relationship

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key= True)
    jp_word = Column(String, nullable = False)
    meaning = Column(String, nullable = True)
    image = Column(String, nullable = True)

    deck_associations = relationship("CardDeck", back_populates="card")
    user_relationship = relationship("UserCard", back_populates="card")
