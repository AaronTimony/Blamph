from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Date, JSON
from app.core.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key = True)
    username = Column(String, unique = False, nullable= False)
    email = Column(String, unique = True, nullable = False)
    password = Column(String, nullable = False)
    profile_picture = Column(String, nullable = True)
    all_time_words_reviewed = Column(Integer, default=0)
    new_word_ordering = Column(String, default="deck_frequency")

    daily_new_words_learned = Column(Integer, default=0)
    last_daily_reset = Column(Date, nullable=True)
    timezone = Column(String, default="UTC")

    daily_new_words = Column(Integer, default=20)

    new_word_priority_queue = Column(JSON, default=list)

    deck_associations = relationship("UserDeck", back_populates="user")
    cards = relationship("UserCard", back_populates="user")
