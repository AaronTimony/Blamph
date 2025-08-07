from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Text, Integer, String, Column, Float, ForeignKey
from typing import Optional, List
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
engine = create_engine('postgresql+psycopg2://postgres:simplepassword@localhost:5432/blamphdb', echo=True)

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key = True)
    username = Column(String, nullable= False)
    email = Column(String)
    password = Column(String, nullable = False)

    decks = relationship("Deck", back_populates="user")


class Deck(Base):
    __tablename__ = 'decks'

    id = Column(Integer, primary_key = True)
    deckname = Column(String, nullable = False)
    wordlist = Column(List[String], nullable = False)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="decks")

class Word(Base):
    __tablename__ = 'words'

    id = Column(Integer, primary_key = True)
    word = Column(String, nullable = False)
    deck_id = Column(Integer, ForeignKey('decks.id'))

Base.metadata.create_all(engine)

LocalSession = sessionmaker(bind=engine)

def get_db():
    db = LocalSession()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register/", response_model=UserResponse)
def register_user(user:UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        username=user.username,
        email=user.email,
        password=user.password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@app.get("/users/", response_model=List[str])
def get_users(db: Session = Depends(get_db)):
    usernames = db.query(User.username).all()

    return [username[0] for username in usernames]
