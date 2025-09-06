from sqlalchemy.orm import Session
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import or_
from app.core.auth import get_password_hash
from app.models import User
from app.schemas.users import UserRegister

class UserService:
    def register_user_service(self, user_data: UserRegister, db: Session):
        try:
            existing_name = db.query(User).filter(
                    User.username == user_data.username,
            ).first()

            if existing_name:
                raise HTTPException(status_code=400, detail="Username already exists.")

            existing_email = db.query(User).filter(
                User.email == user_data.email
            ).first()

            if existing_email:
                raise HTTPException(status_code=400, detail="Email is already in use.")

            hashed_pw = get_password_hash(user_data.password)
            db_user = User(
                username=user_data.username,
                password=hashed_pw,
                email=user_data.email
            )

            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            return {"message": "User Created Successfully"}

        except ValidationError as e:
            return {"message": str(e.errors()[0]['msg'])}

