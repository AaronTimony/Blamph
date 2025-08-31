from sqlalchemy.orm import Session
from app.core.auth import get_password_hash
from app.models import User

class UserService:
    def register_user_service(self, password: str, username: str, full_name: str, email: str, db: Session):
        hashed_pw = get_password_hash(password)
        db_user = User(
            username=username,
            password=hashed_pw,
            full_name=full_name,
            email=email
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
