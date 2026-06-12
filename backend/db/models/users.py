"""
Contains table Users
"""

from sqlalchemy import CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class User(Base):
    __tablename__ = "Users"
    __table_args__ = (
        CheckConstraint(
            "length(email) BETWEEN 3 AND 127", name="email_length_check"
        ),  # 127 chosen instead of max of 320 given most common mail providers limit at ~64 characters
        CheckConstraint(
            "length(display_name) BETWEEN 3 AND 24", name="display_name_length_check"
        ),  # Limit to 24 to prevent future formatting issues on frontend
    )

    user_id: Mapped[int] = mapped_column(
        primary_key=True
    )  # Primary key being True, and the type being an int causes autoincrement to be enabled.

    email: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)

    password_hash: Mapped[str] = mapped_column(nullable=False)

    display_name: Mapped[str] = mapped_column(String(25), nullable=False)
