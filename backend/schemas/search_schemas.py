import datetime as dt

from pydantic import BaseModel


class FixedSearchEvent(BaseModel):
    event_id: int
    calendar_id: int
    calendar_name: str
    name: str
    date: dt.date
    start_time: dt.time
    end_time: dt.time
    notes: str | None = None
    recurrence_rule: str | None = None
    reminder: bool


class FloatingSearchTask(BaseModel):
    task_id: int
    calendar_id: int
    calendar_name: str
    name: str
    date: dt.date
    duration_minutes: int
    notes: str | None = None
    recurrence_rule: str | None = None
    reminder: bool
    preferred_window: str | None = None
    scheduled_start: dt.time | None = None
    manually_scheduled: bool
