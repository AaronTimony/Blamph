from app.api.v1.endpoints.auth import get_current_active_user
from fastapi import APIRouter, Depends 
from sqlalchemy.orm import Session
from app.models import User
from app.core.database import get_db
from app.services.settings_service import UserSettings
from app.schemas.settings import UpdateNewWordsRequest

router = APIRouter()
settings_service = UserSettings()


@router.patch("/updateNewWords")
def update_user_new_daily_words(request: UpdateNewWordsRequest,
                                current_user: User = Depends(get_current_active_user), 
                                db: Session = Depends(get_db)):
    return settings_service.update_user_daily_words(request.newDailyWords, current_user.username, db)
