"""
Contains table Users
"""

from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class User(Base):
    __tablename__ = "Users"

    user_id: Mapped[int] = mapped_column(
        primary_key=True
    )  # Primary key being True, and the type being an int causes autoincrement to be enabled.

    email: Mapped[str] = mapped_column(unique=True, nullable=False)

    password_hash: Mapped[str] = mapped_column(nullable=False)

    display_name: Mapped[str] = mapped_column(nullable=False)
