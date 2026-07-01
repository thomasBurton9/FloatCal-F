import datetime as dt

from sqlalchemy import JSON, CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

type SchedulingWindows = dict[
    str, tuple[dt.time, dt.time]
]  # Make sure that scheduling windows windows are in a valid format


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

    # Possibly checks to make sure it is a valid scheduling window and also possibly make the dict more explicit e.g. dict[str, tuple[dt.time, dt.time]] - though that fails import
    scheduling_windows: Mapped[SchedulingWindows | None] = mapped_column(
        JSON,
        nullable=True,  # Format "Morning" : [0800, 1000]
        # Format: dict[str, tuple[dt.time, dt.time]]
    )  # Maybe add defaults later + change nullable=False
