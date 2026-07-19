from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Calendar(Base):
    __tablename__ = "Calendars"
    __table_args__ = (
        CheckConstraint("length(name) BETWEEN 1 and 16", name="name_length_check"),
    )

    calendar_id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(17), nullable=False)

    colour: Mapped[str] = mapped_column(nullable=False)  # Hexcode

    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("Users.user_id"), nullable=False
    )


class CalendarMember(Base):
    __tablename__ = "CalendarMembers"
    __table_args__ = (
        UniqueConstraint("calendar_id", "user_id", name="unique_calendar_user"),
    )  # Make sure that there are no duplicate memberships of a user in a calendar

    calendar_member_id: Mapped[int] = mapped_column(primary_key=True)

    calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("Users.user_id"), nullable=False)
