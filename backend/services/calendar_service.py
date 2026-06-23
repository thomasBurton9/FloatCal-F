import datetime as dt
from typing import List

from db.models.calendars import Calendar
from db.models.items import FixedEvent, FloatingTask
from db.models.settings import Setting
from db.queries.calendar_db import get_calendar_info, list_items_for_calendar_date
from db.queries.settings_db import get_settings


# There might be no point in these functions
# api/ could call db/queries/ directly
# For more complex functions it would make sense though
def get_items(calendar_id: int, date: dt.date):
    raise NotImplementedError
    # return calendar_db.list_items_for_calendar_date(calendar_id, date)


# Potentially add more checks for loop arounds and similar
def add_time(time: dt.time, amount: int) -> dt.time:
    time_date = dt.datetime.combine(dt.datetime.today(), time)

    amount_delta: dt.timedelta = dt.timedelta(minutes=amount)

    return (time_date + amount_delta).time()


# Uses the settings of the user who created the calendar
def get_free_gaps(calendar_id: int, date: dt.date) -> list[tuple[dt.time, dt.time]]:
    try:
        calendar_info: Calendar = get_calendar_info(calendar_id)
    except ValueError as e:
        raise ValueError(str(e))
    user_id: int = calendar_info.created_by_user_id

    try:
        settings: Setting = get_settings(user_id)
    except ValueError as e:
        raise ValueError(str(e))

    day_end: dt.time = settings.sleep_start
    day_start: dt.time = settings.sleep_end
    buffer_minutes: int = settings.buffer_minutes

    calendar_items: List[FixedEvent | FloatingTask] = list_items_for_calendar_date(
        calendar_id, date
    )

    gaps: list[tuple[dt.time, dt.time]] = []

    previous_end: dt.time = day_start
    for item in calendar_items:
        item_start_time: dt.time
        if isinstance(item, FloatingTask):
            # Not using the api method  to avoid unecessary db calls -> get_scheduled_end_api
            if not item.scheduled_start:
                raise ValueError(
                    "No scheduled start, list_item_for_calendar_date errored"
                )
            item_start_time = add_time(item.scheduled_start, -buffer_minutes)
        else:
            item_start_time = add_time(item.start_time, -buffer_minutes)
        if item_start_time > previous_end:
            gaps.append((previous_end, item_start_time))
        if isinstance(item, FloatingTask):
            previous_end = add_time(
                item_start_time, item.duration_minutes + 2 * buffer_minutes
            )
        else:
            previous_end = add_time(item.end_time, buffer_minutes)

    if previous_end < day_end:
        gaps.append((previous_end, day_end))

    return gaps
