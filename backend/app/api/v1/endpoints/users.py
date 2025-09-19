from fastapi import APIRouter, Depends, UploadFile, File
from app.schemas.users import UserRegister
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.services.user_services import UserService
from app.api.v1.endpoints.auth import get_current_active_user
from app.models import User

router = APIRouter()
user_service = UserService()

@router.post("/register/")
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    return user_service.register_user_service(user_data, db)

@router.post("/profile_picture")
async def post_profile_picture(file: UploadFile = File(...),
                         current_user: User = Depends(get_current_active_user)):
    return await user_service.upload_profile_picture(file, current_user.username)
