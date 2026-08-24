import datetime as dt
from typing import List

from db.models.calendars import Calendar
from db.models.items import FixedEvent, FloatingTask
from db.models.settings import Setting
from db.queries.calendar_db import get_calendar_info, list_items_for_calendar_date
from db.queries.item_db import get_task_info, schedule_task
from db.queries.settings_db import get_settings


# Potentially add more checks for loop arounds and similar
# Function is a helper that allows for simple addition of time with minutes / duration
def add_time(time: dt.time, amount: int) -> dt.time:
    time_date: dt.datetime = dt.datetime.combine(dt.datetime.today(), time)

    amount_delta: dt.timedelta = dt.timedelta(minutes=amount)

    return (time_date + amount_delta).time()


# You cannot subtract 2 time objects from each other, so we have to convert to datetime before converting back to an integer
def calculate_time_difference(end_time: dt.time, start_time: dt.time) -> int:
    if not end_time > start_time:
        raise ValueError("End time must be after start time")

    end_datetime: dt.datetime = dt.datetime.combine(dt.datetime.today(), end_time)
    start_datetime: dt.datetime = dt.datetime.combine(dt.datetime.today(), start_time)

    difference: dt.timedelta = end_datetime - start_datetime

    return int(difference.total_seconds() // 60)


# Uses the settings of the user who created the calendar
def get_free_gaps(calendar_id: int, date: dt.date) -> list[tuple[dt.time, dt.time]]:
    # Function to search a users calendar and based on the settings of the owner of that calendar
    # Output all gaps between scheduled tasks and events that aren't during sleep, and that respect the buffer time between events
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


def parse_scheduling_window(window: list[str]) -> tuple[dt.time, dt.time]:
    """Convert a scheduling window in json to datetime.time values for easy comparison"""
    # Validate window, preventing invalid inputs
    if len(window) != 2:
        raise ValueError("Scheduling window must contain a start and end time only")

    try:
        start = dt.time.fromisoformat(window[0])
        end = dt.time.fromisoformat(window[1])
    except ValueError as e:
        raise ValueError("Scheduling window contains an invalid time", e)

    return start, end


def schedule_floating_task(calendar_id: int, date: dt.date, task_id: int):
    try:
        calendar_info: Calendar = get_calendar_info(calendar_id)
    except ValueError as e:
        raise ValueError(str(e))

    # the calendar's owner's settings are used and not the user's who requested the schedule
    user_id: int = calendar_info.created_by_user_id
    try:
        settings: Setting = get_settings(user_id)
    except ValueError as e:
        raise ValueError(str(e))

    try:
        task: FloatingTask = get_task_info(task_id)
    except ValueError as e:
        raise ValueError(str(e))

    if task.calendar_id != calendar_id:
        raise ValueError("Scheduling failed: task does not match calendar")

    if task.date != date:
        raise ValueError(
            "Scheduling failed: task date does not match given data"
        )  # In the future add check for recurring events.

    # This check was in pseudocode, however might not be needed, given a user might want to
    # reschedule a task automatically even if it is already manually scheduled
    # Also unify format for error messages raised
    if task.manually_scheduled:
        raise ValueError("Scheduling failed: task is manually scheduled")

    unscheduled: bool = False
    scheduled_start: dt.time | None = None

    if task.scheduled_start:
        unscheduled = True
        scheduled_start = task.scheduled_start
        schedule_task(task_id, None)
    # Possibly pass calendar_info, settings into this function to prevent 2 calls of the same function
    # unless get_free_gaps() is to be used elsewhere
    free_gaps: list[tuple[dt.time, dt.time]] = get_free_gaps(calendar_id, date)

    valid_gaps: list[tuple[dt.time, dt.time]] = []

    for gap in free_gaps:
        gap_duration: int = calculate_time_difference(gap[1], gap[0])
        if gap_duration >= task.duration_minutes:
            valid_gaps.append(gap)

    if len(valid_gaps) == 0:
        if unscheduled and scheduled_start is not None:
            schedule_task(task_id, scheduled_start)
        else:
            schedule_task(task_id, None)
        # Possibly there is a better way of informing the frontend of this error versus other errors
        raise ValueError(
            "Scheduling failed: no available time slot"
        )  # When changing this message change also the comparison in AddItem.jsx -> handleAddItem

    preferred_gaps: list[tuple[dt.time, dt.time]] = []

    # Variable defined but not initialised to maintain full function scope
    selected_gap: tuple[dt.time, dt.time]

    stored_preferred_window = (
        settings.scheduling_windows.get(task.preferred_window)
        if task.preferred_window is not None and settings.scheduling_windows is not None
        else None
    )

    # Have to convert scheduling windows from string into python datetime objects to be compared easily in scheduler code
    preferred_window = (
        parse_scheduling_window(stored_preferred_window)
        if stored_preferred_window is not None
        else None
    )

    if preferred_window is not None:
        for gap in valid_gaps:
            # Logic changes from pseudocode design tools given error encountered in testing
            # If there is a single large gap such as 0700-2300 and a preferred window like 1800-2300
            # Previously it would've checked if the gap is within the preferred window
            # Now it checks if the task could fit inside the preferred window merged with the gap
            preferred_start = max(gap[0], preferred_window[0])
            preferred_end = min(gap[1], preferred_window[1])

            if (
                preferred_end > preferred_start
                and calculate_time_difference(preferred_end, preferred_start)
                >= task.duration_minutes
            ):
                preferred_gaps.append((preferred_start, preferred_end))

    if len(preferred_gaps) != 0:  # Select the first gap that is preferred + valid
        selected_gap = preferred_gaps[0]
    else:
        selected_gap = valid_gaps[0]

    schedule_task(
        task_id, selected_gap[0]
    )  # Schedule task at start time of the selected gap
