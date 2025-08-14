from fastapi import APIRouter
from app.api.v1.endpoints import users, decks, words, auth

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(decks.router, prefix="/decks", tags=["decks"])
api_router.include_router(words.router, prefix="/words", tags=["words"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
