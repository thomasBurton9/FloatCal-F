import datetime as dt
from typing import Any, Annotated

from pydantic import BaseModel, Field


# More validation checks are required
class UpdateSettings(BaseModel):
    sleep_start: dt.time = None  # type: ignore[assignment]
    sleep_end: dt.time = None  # type: ignore[assignment]

    buffer_minutes: Annotated[int, Field(ge=1, le=1440)] = None  # type: ignore[assignment]

    notifications_enabled: bool = None  # type: ignore[assignment]

    notification_sound: str = None  # type: ignore[assignment]

    scheduling_windows: dict[str, Any] | None = None
