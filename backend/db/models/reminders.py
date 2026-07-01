import datetime as dt

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


# item_id changed to task_id and event_id separately due to limitations with SQLAlchemy ORM
# item_type removed for similar reason - could be re added or just use a method to check the item type
class Reminder(Base):
    __tablename__ = "Reminders"
    __table_args__ = (
        UniqueConstraint("task_id", "minutes_before", name="unique_task_reminder"),
        UniqueConstraint("event_id", "minutes_before", name="unique_event_reminder"),
        CheckConstraint(
            "(task_id IS NOT NULL AND event_id IS NULL) OR (task_id IS NULL AND event_id IS NOT NULL)",
            name="one_reminder_target",
        ),
    )
    reminder_id: Mapped[int] = mapped_column(primary_key=True)

    task_id: Mapped[int | None] = mapped_column(
        ForeignKey("FloatingTasks.task_id"), nullable=True
    )
    event_id: Mapped[int | None] = mapped_column(
        ForeignKey("FixedEvents.event_id"), nullable=True
    )

    minutes_before: Mapped[int] = mapped_column(nullable=False)

    enabled: Mapped[bool] = mapped_column(default=True)


class CompletionLog(Base):
    __tablename__ = "CompletionLogs"
    __table_args__ = (
        UniqueConstraint("task_id", "completed_date", name="unique_task_completion"),
    )

    log_id: Mapped[int] = mapped_column(primary_key=True)

    task_id: Mapped[int] = mapped_column(
        ForeignKey("FloatingTasks.task_id"), nullable=False
    )

    completed_date: Mapped[dt.date] = mapped_column(nullable=False)
