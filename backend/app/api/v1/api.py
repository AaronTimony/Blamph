from fastapi import APIRouter
from app.api.v1.endpoints import users, decks, words, auth, search, review, user_settings

api_router = APIRouter()
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(decks.router, prefix="/decks", tags=["decks"])
api_router.include_router(words.router, prefix="/words", tags=["words"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(review.router, prefix="/review", tags=["review"])
api_router.include_router(user_settings.router, prefix="/settings", tags=["settings"])
