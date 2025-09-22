from app.core.database import Base
from sqlalchemy import Integer, ForeignKey, DateTime, Column

class UserReview(Base):
    __tablename__ = "user_reviews"

    id = Column(Integer, primary_key = True)
    user_id = Column(Integer, ForeignKey('users.id'))
    review_date = Column(DateTime, nullable=False)
