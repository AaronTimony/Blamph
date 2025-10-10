from fsrs import Scheduler, Rating  
from zoneinfo import ZoneInfo
from fsrs import Card as FSRSCard
from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import User, UserCard, Card, CardDeck, UserDeck
from datetime import datetime, timezone, timedelta, date
# I need to pass a rating (that i translate to the ratings here), card_id, first_time

# I need to return, due_date, level (manual), card_id
class SRS:
    def __init__(self):
        self.scheduler = Scheduler(
            parameters = (
                    0.212,
                    1.2931,
                    2.3065,
                    8.2956,
                    6.4133,
                    0.8334,
                    3.0194,
                    0.001,
                    1.8722,
                    0.1666,
                    0.796,
                    1.4835,
                    0.0614,
                    0.2629,
                    1.6483,
                    0.6014,
                    1.8729,
                    0.5425,
                    0.0912,
                    0.0658,
                    0.1542,
            ),
            desired_retention = 0.9,
            learning_steps = (timedelta(minutes=3), timedelta(minutes=10), timedelta(days=1), timedelta(days=3)),
            relearning_steps = (timedelta(minutes=10),),
            maximum_interval = 36500,
            enable_fuzzing = True
        )

    def calculate_next_review(self, card_id: int, rating: str, first_time: bool):
        card = FSRSCard(card_id=card_id)

        if first_time:
            return self.handle_first_time_card(rating, card)

        else:
            return self.handle_review(rating, card)


    def handle_first_time_card(self, user_rating: str, card: FSRSCard):
        """When the user first encounters a card, i want to ask them and see if they already feel they know the card. If so, they will have the card will be registered as known for them and will display as known. Known cards will not be encountered in the SRS system."""
        cur_time = datetime.now(timezone.utc)

        if user_rating == "I know this word":
            known_state = True
            level = 5
            due_date = cur_time + timedelta(days=10000)
            return (level, due_date, known_state)

        elif user_rating == "I do not know this word":
            known_state = False
            card, review_log = self.scheduler.review_card(card, Rating.Again) 
            due_date = card.due
            level = card.state

            return (level, due_date, known_state)

    def handle_review(self, user_rating: str, card: FSRSCard):
        if user_rating == "Easy":
            card_rating = Rating.Easy

        elif user_rating == "Good":
            card_rating = Rating.Good

        elif user_rating == "Hard":
            card_rating = Rating.Hard

        elif user_rating == "Again":
            card_rating = Rating.Again

        card, review_log = self.scheduler.review_card(card, card_rating)

        due_date = card.due

        time_delta = due_date - datetime.now(timezone.utc)

        # Here we hardcode some values to save users level of a certain card
        # I just wanted the levels to go up to 5 so I hardcode certain intervals
        # where if the users next review is in say 5 days, the level of that card
        # will adapt to that length. (the longer the interval the higher the level)
        if time_delta < timedelta(days=3):
            level = 1

        elif timedelta(days=3) <= time_delta < timedelta(days=7):
            level = 2

        elif timedelta(days=7) <= time_delta < timedelta(days=30):
            level = 3

        elif timedelta(days=21) <= time_delta < timedelta(days=90):
            level  = 4

        elif timedelta(days=90) <= time_delta < timedelta(days=365):
            level = 5

        else:
            level = 5

        return (level, due_date)

    def get_due_cards(self, user: User, db: Session):
        cur_date = datetime.now(timezone.utc)

        rank = func.rank().over(order_by=Card.overall_frequency.desc())

        rank_subq = (
            db.query(
                Card.id,
                rank.label("rank")
            ).subquery()
        )

        get_due_card = (db.query(Card.jp_word,
                                 Card.meaning,
                                 Card.reading,
                                 Card.overall_frequency,
                                 rank_subq.c.rank,
                                 )
        .join(UserCard, Card.id == UserCard.card_id)
        .join(rank_subq, Card.id == rank_subq.c.id)  # ADD THIS LINE
        .filter(UserCard.user_id == user.id).
        filter(UserCard.next_review < cur_date).
        filter(UserCard.level > 0).first())

        return get_due_card

    def get_newest_card(self, current_user: User, db: Session):
        """Change this to just one query joining Card and UserCard"""

        try:
            user_first_deck_id = db.query(UserDeck.deck_id).filter(UserDeck.user_id == current_user.id).filter(UserDeck.deck_order == 1).scalar()

            if not user_first_deck_id:
                raise HTTPException(status_code=404, detail="User has no decks")

            rank = func.rank().over(order_by=Card.overall_frequency.desc())

            rank_subq = (
                db.query(
                    Card.id,
                    rank.label("rank")
                ).subquery()
            )

            if current_user.new_word_ordering == "deck_frequency":
                order_method = CardDeck.word_frequency.desc()
            elif current_user.new_word_ordering == "global_frequency":
                order_method = rank_subq.c.rank.asc()
            else:
                order_method = CardDeck.id.asc()

            user_cards_subq = (
                db.query(UserCard.card_id)
                .filter(UserCard.user_id == current_user.id)
                .subquery()
            )

            newest_card = (db.query(Card.jp_word,
                                    Card.meaning,
                                    Card.reading,
                                    CardDeck.card_id,
                                    Card.overall_frequency,
                                    rank_subq.c.rank)
                           .join(Card, Card.id == CardDeck.card_id)
                           .join(rank_subq, rank_subq.c.id == Card.id)
                           .filter(CardDeck.deck_id == user_first_deck_id)
                           .filter(~Card.id.in_(user_cards_subq))
                           .order_by(order_method)
                           .first())


            if not newest_card:
                return None

            return newest_card
        except Exception as e:
            print("Error in obtaining new word (User may have no decks added)", e)

    def get_new_cards_count(self, current_user: User, db: Session):
        user_tz = ZoneInfo(current_user.timezone or 'UTC')
        today = datetime.now(user_tz).date()
        if current_user.last_daily_reset != today:
            return current_user.daily_new_words

        new_cards_count = db.query(User.daily_new_words).filter(User.id == current_user.id).scalar()

        return new_cards_count

    def get_due_cards_count(self, user_id: int, db: Session):
        cur_date = datetime.now()

        review_cards_count = db.query(UserCard).filter(UserCard.user_id == user_id).filter(UserCard.level > 0).filter(UserCard.next_review < cur_date).filter(UserCard.known == False).count()

        return review_cards_count

    def get_known_cards_count(self, user_id: int, db: Session):
        known_cards_count = db.query(UserCard).filter(UserCard.user_id == user_id).filter(UserCard.known == True).count()

        return known_cards_count
