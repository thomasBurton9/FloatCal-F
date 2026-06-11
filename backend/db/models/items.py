"""
Contains tables Fixed Event and Floating Task
"""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

import datetime as dt


class FixedEvent(Base):
    __tablename__ = "FixedEvents"

    event_id: Mapped[int] = mapped_column(primary_key=True)

    calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )

    name: Mapped[str] = mapped_column(nullable=False)

    date: Mapped[dt.date] = mapped_column(nullable=False)

    start_time: Mapped[dt.time] = mapped_column(nullable=False)

    end_time: Mapped[dt.time] = mapped_column(
        nullable=False
    )  # Potentially change to dt.datetime to allow for multiday events

    notes: Mapped[str | None] = mapped_column(nullable=True)

    recurrence_rule: Mapped[str | None] = mapped_column(
        nullable=True
    )  # Can be None, "Daily", "Weekly", "Fortnightly" etc - Maybe make this a constraint

    reminder: Mapped[bool] = mapped_column(default=False)


class FloatingTask(Base):
    __tablename__ = "FloatingTasks"

    task_id: Mapped[int] = mapped_column(primary_key=True)

    calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )

    name: Mapped[str] = mapped_column(nullable=False)

    date: Mapped[dt.date] = mapped_column(nullable=False)

    duration_minutes: Mapped[int] = mapped_column(nullable=False)

    notes: Mapped[str | None] = mapped_column(nullable=True)

    recurrence_rule: Mapped[str | None] = mapped_column(
        nullable=True
    )  # Can be None, "Daily", "Weekly", "Fortnightly" etc - Maybe make this a constraint directly in db

    reminder: Mapped[bool] = mapped_column(default=False)

    preferred_window: Mapped[str | None] = mapped_column(
        nullable=True
    )  # Potentially connect to Settings.scheduling_windows

    scheduled_start: Mapped[dt.time | None] = mapped_column(nullable=True)

    manually_scheduled: Mapped[bool] = mapped_column(default=False)
