from app.core.database import Base
from sqlalchemy import Integer, ForeignKey, Column, Date

class UserNewWords(Base):
    __tablename__ = "user_new_words"

    id = Column(Integer, primary_key = True)
    user_id = Column(Integer, ForeignKey('users.id'))
    date = Column(Date, nullable=False)
    new_words_count = Column(Integer, default=0)
