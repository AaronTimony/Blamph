from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from pydantic import ValidationError
from sqlalchemy import or_
from app.core.auth import get_password_hash
from app.models import User
from app.schemas.users import UserRegister
from PIL import Image 
import os
import io

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

    async def validate_profile_picture(self, file: UploadFile):
        supported_extensions = {".jpg", ".jpeg", ".png", ".webp"}

        if not file.filename:
            raise HTTPException(status_code=400, detail="No filenmae provided")

        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in supported_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type, only jpg, jpeg, png, webp are supported")

        max_size = 10 * 1024 * 1024

        file_content = await file.read()

        if len(file_content) > max_size:
            raise HTTPException(status_code=400, detail="File too large, maximum size is 10MB")

        try:
            # Use io to create "file-like object" as this doesnt create copies
            # and is quicker than just reading the file.
            # PIL needs a file-like object, not raw bytes thats why we cannot
            # simply use the file_content that we read.
            img = Image.open(io.BytesIO(file_content))
            img.verify()

        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image file")

        return file_content, file_ext

    async def upload_profile_picture(self, file: UploadFile, username: str):

        file_content, file_ext = await self.validate_profile_picture(file)

        if not file_content:
            return "Profile picture is invalid"

        file_path = f"app/images/{username}{file_ext}"

        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

        return {"message": "Profile picture uploaded successfully"}
