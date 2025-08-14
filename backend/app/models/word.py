from sqlalchemy.orm import relationship
from sqlalchemy import Integer, String, Column, ForeignKey
from app.core.database import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key = True)
    word_text = Column(String, nullable = False)

    deck_associations = relationship("WordDeck", back_populates="word")
