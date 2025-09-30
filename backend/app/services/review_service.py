from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.services.srs import SRS
from app.models import User, UserCard, Card, UserReview, UserNewWords
from app.schemas.review import Newest_cards, Review_cards, CardRatingRequest, CardCountsResponse, ReviewStats
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import json

srs = SRS()

class ReviewService:
    def get_newest_card(self, current_user: User, db: Session):
        """Code here is a bit weird, when I don't find a card, I want to run this again until i do find one. I created a max_attempts, meaning if 100 words are cycled through with no new word we give up. If we already have a word in users database, we go again to try find new one."""

        try:
            if current_user.new_word_priority_queue and len(current_user.new_word_priority_queue) > 0:
                card = db.query(Card.jp_word, Card.meaning, Card.reading).filter(Card.id == current_user.new_word_priority_queue[0]).first()

                return Newest_cards(
                    jp_word = card[0],
                    meaning = card[1],
                    reading = card[2]
                )

            card_tuple = srs.get_newest_card(current_user, db)

            if card_tuple:
                return Newest_cards(
                    jp_word = card_tuple[0],
                    meaning = card_tuple[1],
                    reading = card_tuple[2]
                )
        except Exception as e:
            print("SOMETHING BAD HAPPENED!", e)

    def get_review_card(self, current_user: User, db: Session):

        user_due_card = srs.get_due_cards(current_user.id, db)
        if not user_due_card:
            return Review_cards(jp_word=None, meaning=None, reading=None)

        return Review_cards(
            jp_word=user_due_card[0],
            meaning=user_due_card[1],
            reading=user_due_card[2]
        )

    def new_card_rating(self, req: CardRatingRequest,
                        current_user: User,
                        db: Session):

        if current_user.new_word_priority_queue != []:
            updated_queue = current_user.new_word_priority_queue[1:]

            db.query(User).filter(User.id == current_user.id).update({
                User.new_word_priority_queue: json.dumps(updated_queue)
            })

            db.commit()

        card_id = db.query(Card.id).filter(Card.jp_word == req.jp_word).scalar()

        if not card_id:
            raise HTTPException(status_code=404, detail="Card not found")

        """I think i can get rid of this, already checked if user has card when getting it right?"""
        cur_card = (db.query(UserCard)
                     .filter(UserCard.user_id == current_user.id)
                     .filter(UserCard.card_id == card_id)
                     .first())

        if cur_card:
            raise HTTPException(status_code=404, detail="User already has card, not new")

        level, next_review, known = srs.calculate_next_review(card_id, req.rating, True)

        # Ensuring to track users daily words learned
        self.handle_new_card_statistics(current_user, db)

        new_user_card = UserCard(card_id = card_id,
                                 user_id = current_user.id,
                                 level = level,
                                 next_review = next_review,
                                 known = known)
        db.add(new_user_card)
        db.commit()


    def review_card_rating(self, req: CardRatingRequest,
                           current_user: User,
                           db: Session):

        card_id = db.query(Card.id).filter(Card.jp_word == req.jp_word).scalar()
        if not card_id:
            raise HTTPException(status_code=404, detail="Card not found")

        cur_card = (db.query(UserCard)
                     .filter(UserCard.user_id == current_user.id)
                     .filter(UserCard.card_id == card_id)
                     .first())

        if not cur_card:
            raise HTTPException(status_code=404, detail="Could not find user's card")

        new_level, next_review = srs.calculate_next_review(card_id, req.rating, False)

        # Stores users daily reviews, weekly, all time here.
        store_review = UserReview(user_id=current_user.id, review_date=datetime.now())

        db.add(store_review)

        current_user.all_time_words_reviewed += 1

        cur_card.level = new_level
        cur_card.next_review = next_review

        db.commit()
        db.refresh(cur_card)
        db.refresh(store_review)

    def get_card_counts(self, current_user: User, db: Session):
        new_count = srs.get_new_cards_count(current_user, db) - current_user.daily_new_words_learned

        due_count = srs.get_due_cards_count(current_user.id, db)
        known_count = srs.get_known_cards_count(current_user.id, db)

        return CardCountsResponse(
            due_count=due_count,
            new_count=new_count,
            known_count=known_count
        )

    def get_review_stats(self, current_user: User, db: Session):
        daily_interval = timedelta(days=1)
        weekly_interval = timedelta(days=7)
        cur_time = datetime.now()

        daily_reviews = (db.query(UserReview)\
                         .filter(UserReview.user_id == current_user.id)\
                         .filter(UserReview.review_date > cur_time - daily_interval)\
                         .count())

        weekly_reviews = (db.query(UserReview)\
                         .filter(UserReview.user_id == current_user.id)\
                         .filter(UserReview.review_date > cur_time - weekly_interval)\
                         .count())

        return ReviewStats(daily_reviews=daily_reviews,
                           weekly_reviews=weekly_reviews,
                           all_time_reviews=current_user.all_time_words_reviewed)

    def handle_new_card_statistics(self, current_user: User, db: Session):
        user_tz = ZoneInfo(current_user.timezone or 'UTC')
        today = datetime.now(user_tz).date()

        if current_user.last_daily_reset != today:
            if current_user.last_daily_reset and current_user.daily_new_words_learned > 0:
                yesterday_record = UserNewWords(
                    user_id = current_user.id,
                    date = current_user.last_daily_reset,
                    new_words_count = current_user.daily_new_words_learned
                )

                db.add(yesterday_record)

            current_user.daily_new_words_learned = 0
            current_user.last_daily_reset = today

        current_user.daily_new_words_learned += 1

        db.commit()

