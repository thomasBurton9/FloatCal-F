"""
Contains tables Calendars and Calendar Members
"""

from sqlalchemy import ForeignKey, UniqueConstraint
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


class CalendarMember(Base):
    __tablename__ = "CalendarMembers"
    __table_args__ = tuple(
        UniqueConstraint("calendar_id", "user_id", name="unique_calendar_user")
    )  # Make sure that there are no duplicate memberships of a user in a calendar

    calendar_member_id: Mapped[int] = mapped_column(primary_key=True)

    calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("Users.user_id"), nullable=False)
