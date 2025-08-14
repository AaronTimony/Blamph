from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key = True)
    username = Column(String, nullable= False)
    email = Column(String)
    full_name = Column(String)
    password = Column(String, nullable = False)

    deck_associations = relationship("UserDeck", back_populates="user")
