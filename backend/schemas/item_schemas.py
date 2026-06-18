import datetime as dt
from typing import Annotated, Literal

from pydantic import BaseModel, Field, ValidationInfo
from pydantic.functional_validators import field_validator


# calendar_id not needed given it is provided in the api endpoint "/{calendar_id}"
# # item_id is not needed as it is created service side
class CreateFixedEvent(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=63)]
    date: dt.date
    notes: Annotated[str | None, Field(min_length=0, max_length=319)] = None
    recurrence_rule: (
        Literal["daily", "weekly", "fortnightly", "monthly", "yearly"] | None
    ) = None
    reminder: bool = False
    start_time: dt.time
    end_time: dt.time

    @field_validator("end_time", mode="after")
    def validate_time(cls, value: dt.time, info: ValidationInfo) -> dt.time:
        if value <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return value


class CreateFloatingTask(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=63)]
    date: dt.date
    duration_minutes: Annotated[
        int, Field(ge=1, le=1440)
    ]  # Potentially hardcode these (1<=x<=1440) in a config file to allow changing and keep them the same across folders/files
    notes: Annotated[str | None, Field(min_length=0, max_length=319)] = None
    recurrence_rule: (
        Literal["daily", "weekly", "fortnightly", "monthly", "yearly"] | None
    ) = None
    reminder: bool = False
    preferred_window: str | None = (
        None  # Maybe somehow make sure that the preferred_window matches that of the user settings? Thought it might require going calendar_id -> created_by_user -> user_settings
    )
    scheduled_start: dt.time | None
    manually_scheduled: bool = False


class ItemType(BaseModel):
    item_type: Literal["event", "task"]


# For updating, some fields can be left out, but can not be set to None/null
# this includes name which cannot be None.
# That is why name = None as the default, but does not accept None as a type
# The comment at the end of each line is to prevent mypy from flagging it.
class UpdateFixedEvent(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=63)] = None  # type: ignore[assignment]
    date: dt.date = None  # type: ignore[assignment]
    notes: Annotated[str | None, Field(min_length=0, max_length=319)] = None
    recurrence_rule: (
        Literal["daily", "weekly", "fortnightly", "monthly", "yearly"] | None
    ) = None
    reminder: bool = None  # type: ignore[assignment]
    start_time: dt.time = None  # type: ignore[assignment]
    end_time: dt.time = None  # type: ignore[assignment]


class UpdateFloatingTask(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=63)] = None  # type: ignore[assignment]
    date: dt.date = None  # type: ignore[assignment]
    duration_minutes: Annotated[int, Field(ge=1, le=1440)] = None  # type: ignore[assignment]  # Potentially hardcode these (1<=x<=1440) in a config file to allow changing and keep them the same across folders/files
    notes: Annotated[str | None, Field(min_length=0, max_length=319)] = None
    recurrence_rule: (
        Literal["daily", "weekly", "fortnightly", "monthly", "yearly"] | None
    ) = None
    reminder: bool = None  # type: ignore[assignment]
    preferred_window: str | None = (
        None  # Maybe somehow make sure that the preferred_window matches that of the user settings? Thought it might require going calendar_id -> created_by_user -> user_settings
    )
    scheduled_start: dt.time | None = None
    manually_scheduled: bool = None  # type: ignore[assignment]
