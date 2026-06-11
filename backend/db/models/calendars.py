"""
Contains table Calendars 
"""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Calendar(Base):
    __tablename__ = "Calendars"

    calendar_id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(nullable=False)

    colour: Mapped[str] = mapped_column(nullable=False)  # Hexcode

    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("Users.user_id"), nullable=False
    )
