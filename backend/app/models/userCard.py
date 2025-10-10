from app.core.database import Base
from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

class UserCard(Base):
    __tablename__ = "user_cards"

    # Allows for partitioning in psql
    __table_args__ = (
        {"postgresql_partition_by": "HASH (user_id)"},
    )

    card_id = Column(Integer, ForeignKey("cards.id"), primary_key = True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key = True)
    known = Column(Boolean, default=False)
    level = Column(Integer, default=0)
    next_review = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="cards")
    card = relationship("Card", back_populates="user_relationship")

"""After this in raw sql, you can use the following to create the partitioned tables
-- Partition 1 of 8
CREATE TABLE user_cards_p1 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 0);

-- Partition 2 of 8
CREATE TABLE user_cards_p2 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 1);

-- Partition 3 of 8
CREATE TABLE user_cards_p3 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 2);

-- Partition 4 of 8
CREATE TABLE user_cards_p4 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 3);

-- Partition 5 of 8
CREATE TABLE user_cards_p5 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 4);

-- Partition 6 of 8
CREATE TABLE user_cards_p6 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 5);

-- Partition 7 of 8
CREATE TABLE user_cards_p7 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 6);

-- Partition 8 of 8
CREATE TABLE user_cards_p8 PARTITION OF user_cards
FOR VALUES WITH (MODULUS 8, REMAINDER 7);"""
