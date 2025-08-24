from enum import Enum

class CardState(Enum):
    New = "new"
    Learning = "learning"
    Known = "known"

class Rating(Enum):
    Again = 1
    Hard = 2
    Easy = 3

class SRS:
    def __init__(self):
        self.learning = 0

    def calculate_next_review(self, learning_state: CardState, level: Rating, now: datetime):


