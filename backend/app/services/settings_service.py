from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import User

class UserSettings:
    def update_user_daily_words(self, newDailyWords: int, username: str, db: Session):
        try:
            updated_user = db.query(User).filter(User.username == username).update({User.daily_new_words: newDailyWords})

            db.commit()

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not update new daily words in server {e}")

    def update_new_word_ordering(self, newWordOrdering: str, username: str, db: Session):
        try:
            updated_ordering = db.query(User).filter(User.username == username).update({User.new_word_ordering: newWordOrdering})

            db.commit()

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not update new user ordering in database {e}")
