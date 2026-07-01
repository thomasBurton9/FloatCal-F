import datetime as dt

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class FixedEvent(Base):
    __tablename__ = "FixedEvents"
    __table_args__ = (
        CheckConstraint("length(name) BETWEEN 1 and 63", name="name_length_check"),
        CheckConstraint(
            "notes IS NULL or length(notes) < 320", name="note_length_check"
        ),
        CheckConstraint(
            "start_time < end_time", name="valid_event_start_and_end_times"
        ),  # If changing to dt.datetime this needs to be revisited
        CheckConstraint(
            "recurrence_rule IS NULL OR recurrence_rule IN ('daily', 'weekly', 'fortnightly', 'monthly', 'yearly')",
            name="valid_recurrence_rule",
        ),
    )
    event_id: Mapped[int] = mapped_column(primary_key=True)

    calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )

    name: Mapped[str] = mapped_column(String(64), nullable=False)

    date: Mapped[dt.date] = mapped_column(nullable=False)

    start_time: Mapped[dt.time] = mapped_column(nullable=False)

    end_time: Mapped[dt.time] = mapped_column(
        nullable=False
    )  # Potentially change to dt.datetime to allow for multiday events

    notes: Mapped[str | None] = mapped_column(String(320), nullable=True)

    recurrence_rule: Mapped[str | None] = mapped_column(
        nullable=True
    )  # Can be None, "Daily", "Weekly", "Fortnightly" etc - Maybe make this a constraint

    reminder: Mapped[bool] = mapped_column(default=False)


class FloatingTask(Base):
    __tablename__ = "FloatingTasks"
    __table_args__ = (
        CheckConstraint("length(name) BETWEEN 1 and 63", name="name_length_check"),
        CheckConstraint(
            "notes IS NULL or length(notes) < 320", name="note_length_check"
        ),
        CheckConstraint(
            "recurrence_rule IS NULL OR recurrence_rule IN ('daily', 'weekly', 'fortnightly', 'monthly', 'yearly')",
            name="valid_recurrence_rule",
        ),
        CheckConstraint(
            "duration_minutes > 0 AND duration_minutes <= 1440",
            name="valid_task_duration",
        ),  # Currently no support for multi day floating tasks
    )

    task_id: Mapped[int] = mapped_column(primary_key=True)

    calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )

    name: Mapped[str] = mapped_column(String(64), nullable=False)

    date: Mapped[dt.date] = mapped_column(nullable=False)

    duration_minutes: Mapped[int] = mapped_column(nullable=False)

    notes: Mapped[str | None] = mapped_column(String(320), nullable=True)

    recurrence_rule: Mapped[str | None] = mapped_column(
        nullable=True
    )  # Can be None, "daily", "weekly", "fortnightly" etc - Maybe make this a constraint directly in db

    reminder: Mapped[bool] = mapped_column(default=False)

    preferred_window: Mapped[str | None] = mapped_column(
        nullable=True
    )  # Potentially connect to Settings.scheduling_windows

    scheduled_start: Mapped[dt.time | None] = mapped_column(nullable=True)

    manually_scheduled: Mapped[bool] = mapped_column(default=False)
