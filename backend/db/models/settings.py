import datetime as dt

from sqlalchemy import JSON, CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

# Scheduling windows are stored in json as iso strings
# i.e. {"Morning": ["09:00:00", "12:00:00"]}.
type SchedulingWindows = dict[str, list[str]]  # Type used to validate input


# More validation checks are required
class Setting(Base):
    __tablename__ = "Settings"
    __table_args__ = (
        CheckConstraint(
            "buffer_minutes > 0 AND buffer_minutes <= 1440", name="valid_buffer_time"
        ),  # Potentially limit buffer time further
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("Users.user_id"), primary_key=True)

    sleep_start: Mapped[dt.time] = mapped_column(default=dt.time(23, 0), nullable=False)
    sleep_end: Mapped[dt.time] = mapped_column(
        default=dt.time(7, 0), nullable=False
    )  # Maybe add checks to make sure one is after/before the other?

    buffer_minutes: Mapped[int] = mapped_column(default=5, nullable=False)

    notifications_enabled: Mapped[bool] = mapped_column(default=True, nullable=False)

    notification_sound: Mapped[str] = mapped_column(default="Alarm", nullable=False)

    scheduling_windows: Mapped[SchedulingWindows | None] = mapped_column(
        JSON,
        nullable=True,
    )  # Maybe add defaults later + change nullable=False
