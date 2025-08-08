from fastapi import APIRouter
from app.api.v1.endpoints import users, decks, words

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
