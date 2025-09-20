from fastapi import HTTPException
from enum import Enum
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, UserCard, Card, CardDeck, UserDeck
from typing import Tuple

class SRS:
    def __init__(self):
        """Here we define the learning steps for when a user rates a card (easy, hard, again). The ratings for new cards and learning cards are different as defined here."""
        self.new_learning_steps = {'Easy': timedelta(minutes=10),
                                   'Hard': timedelta(minutes=5),
                                   'Again': timedelta(minutes=3)}

        self.learning_steps = {'Easy': timedelta(days=5),
                               'Hard': timedelta(days=1),
                               'Again': timedelta(minutes=3)}

    def calculate_next_review(self, level: int, rating: str, first_time: bool) -> Tuple[int, datetime, bool]:

        cur_time = datetime.now()

        if first_time:
            return self.handle_first_time_card(level, cur_time, rating)

        elif level == 1:
            return self.handle_new_card(level, cur_time, rating)

        elif level > 1:
            return self.handle_learning_card(level, cur_time, rating)

    def handle_first_time_card(self, level: int, cur_time: datetime, user_rating: str):
        """When the user first encounters a card, i want to ask them and see if they already feel they know the card. If so, they will have the card will be registered as known for them and will display as known. Known cards will not be encountered in the SRS system."""

        if user_rating == "I know this word":
            known_state = True
            return (level, cur_time, known_state)

        elif user_rating == "I do not know this word":
            known_state = False
            level += 1
            due_date = cur_time + self.new_learning_steps['Again']
            return (level, due_date, known_state)

    def handle_new_card(self, level: int, cur_date: datetime, rating: str):
        """For new cards, once the user has said they are not familiar with the word, we will make sure that they see it twice before moving it to the learning phase (any card with level > 1). It is possible for a learning card to become new again if the user clicks again on a level 1 card."""

        known_state = False
        if rating == "Again":
            due_date = cur_date + self.new_learning_steps['Again']
            return (level, due_date, known_state)

        elif rating == "Hard":
            due_date = cur_date + self.new_learning_steps['Hard']
            return (level, due_date, known_state)

        elif rating == "Easy":
            due_date = cur_date + self.new_learning_steps['Easy']
            level += 1
            return (level, due_date, known_state)

    def handle_learning_card(self, level: int, cur_date: datetime, user_rating: str):
        """This is for cards which are beyond the new phase. Levels will adjust based on user ratings. Intervals are determined by the users current level for this card."""

        known_state = False
        if user_rating == "Again":
            due_date = cur_date + level*self.learning_steps['Again']
            level -= 1
            return (level, due_date, known_state)

        elif user_rating == "Hard":
            due_date = cur_date + level*self.learning_steps['Hard']
            return (level, due_date, known_state)

        elif user_rating == "Easy":
            due_date = cur_date + level*self.learning_steps['Easy']
            level += 2
            return (level, due_date, known_state)

    def get_due_cards(self, user_id: int, db: Session):
        cur_date = datetime.now()

        get_due_card = (db.query(Card.jp_word, Card.meaning, Card.reading).
        join(UserCard, Card.id == UserCard.card_id).
        filter(UserCard.user_id == user_id).
        filter(UserCard.next_review < cur_date).
        filter(UserCard.level > 0).first())

        return get_due_card

    def get_newest_card(self, user_id: int, db: Session, offset: int):
        """Change this to just one query joining Card and UserCard"""

        user_first_deck_id = db.query(UserDeck.deck_id).filter(UserDeck.user_id == user_id).filter(UserDeck.deck_order == 1).scalar()

        if not user_first_deck_id:
            raise HTTPException(status_code=404, detail="User has no decks")

        user_newest_card_id_tuple = (db.query(CardDeck.card_id)
                               .filter(user_first_deck_id == CardDeck.deck_id)
                               .offset(offset).first())

        user_newest_card_id = user_newest_card_id_tuple[0]

        if not user_newest_card_id:
            return None

        already_exist = (db.query(UserCard)
                         .filter(UserCard.user_id == user_id)
                         .filter(UserCard.card_id == user_newest_card_id).first())

        if already_exist:
            return None

        newest_card = db.query(Card.jp_word, Card.meaning, Card.reading).filter(Card.id == user_newest_card_id).first()

        return newest_card

    def get_new_cards_count(self, user_id: int, db: Session):
        new_cards_count = db.query(User.daily_new_words).filter(User.id == user_id).scalar()

        return new_cards_count

    def get_due_cards_count(self, user_id: int, db: Session):
        cur_date = datetime.now()

        review_cards_count = db.query(UserCard).filter(UserCard.user_id == user_id).filter(UserCard.level > 0).filter(UserCard.next_review < cur_date).filter(UserCard.known == False).count()

        return review_cards_count

    def get_known_cards_count(self, user_id: int, db: Session):
        known_cards_count = db.query(UserCard).filter(UserCard.user_id == user_id).filter(UserCard.known == True).count()

        return known_cards_count
