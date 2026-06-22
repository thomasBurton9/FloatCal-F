import datetime as dt
from typing import Literal, Sequence

from fastapi import APIRouter, HTTPException, Query


from db.models.items import FixedEvent, FloatingTask
from db.models.reminders import CompletionLog
from db.queries.item_db import (
    check_event_exists,
    check_task_exists,
    get_event_info,
    get_task_info,
)
from db.queries.reminder_db import (
    get_completion_logs,
    get_event_reminders,
    get_task_reminders,
    mark_task_complete,
    mark_task_incomplete,
)

router = APIRouter(prefix="/api")


# Request in the form of /api/{item_id}/info?item_type=event
@router.get("/{item_id}/info")
def get_item_info_api(item_id: int, item_type: Literal["event", "task"] = Query(...)):
    if item_type == "event":
        if not check_event_exists(item_id):
            raise HTTPException(404, "The event with the specified id does not exist")
        try:
            return get_event_info(item_id)
        except ValueError as e:
            raise HTTPException(422, str(e))
    else:
        if not check_task_exists(item_id):
            raise HTTPException(404, "The task with the specified id does not exist")
        try:
            return get_task_info(item_id)
        except ValueError as e:
            raise HTTPException(422, str(e))


# Potentially add explicit route in the future to only query calendar_id
@router.get("/{item_id}/calendar")
def get_calendar_of_item_api(
    item_id: int, item_type: Literal["event", "task"] = Query(...)
):
    if item_type == "event":
        if not check_event_exists(item_id):
            raise HTTPException(404, "The event with the specified id does not exist")
        try:
            return get_event_info(item_id).calendar_id
        except ValueError as e:
            raise HTTPException(422, str(e))
    else:
        if not check_task_exists(item_id):
            raise HTTPException(404, "The task with the specified id does not exist")
        try:
            return get_task_info(item_id).calendar_id
        except ValueError as e:
            raise HTTPException(422, str(e))


# Potentially add explicit route in the future to only query calendar_id
@router.get("/{item_id}/is_recurring")
def is_item_recurring_api(
    item_id: int, item_type: Literal["event", "task"] = Query(...)
):
    if item_type == "event":
        if not check_event_exists(item_id):
            raise HTTPException(404, "The event with the specified id does not exist")
        try:
            return get_event_info(item_id).recurrence_rule is not None
        except ValueError as e:
            raise HTTPException(422, str(e))
    else:
        if not check_task_exists(item_id):
            raise HTTPException(404, "The task with the specified id does not exist")
        try:
            return get_task_info(item_id).recurrence_rule is not None
        except ValueError as e:
            raise HTTPException(422, str(e))


# Maybe limit these to a date range in the future
@router.get("/{item_id}/reminders")
def get_item_reminders_api(
    item_id: int, item_type: Literal["event", "task"] = Query(...)
):
    if item_type == "event":
        if not check_event_exists(item_id):
            raise HTTPException(404, "The event with the specified id does not exist")
        try:
            return get_event_reminders(item_id)
        except ValueError as e:
            raise HTTPException(422, str(e))
    else:
        if not check_task_exists(item_id):
            raise HTTPException(404, "The task with the specified id does not exist")
        try:
            return get_task_reminders(item_id)
        except ValueError as e:
            raise HTTPException(422, str(e))


@router.get("/{event_id}/duration")
def get_event_duration_api(event_id: int) -> float:
    if not check_event_exists(event_id):
        raise HTTPException(404, "The event with the specified id does not exist")
    event: FixedEvent = get_event_info(event_id)

    time_1: dt.timedelta = dt.timedelta(
        hours=event.start_time.hour, minutes=event.start_time.minute
    )
    time_2: dt.timedelta = dt.timedelta(
        hours=event.end_time.hour, minutes=event.end_time.minute
    )

    result: dt.timedelta = time_2 - time_1

    minutes: float = result.total_seconds() // 60

    return minutes


# Potentially introduce date here i.e. for recurring events if they're only scheduled on one date
@router.get("/{task_id}/is_scheduled")
def get_scheduling_status_api(task_id: int) -> bool:
    if not check_task_exists(task_id):
        raise HTTPException(404, "The task with the specified id does not exist")
    task: FloatingTask = get_task_info(task_id)
    return task.scheduled_start is not None


# introduces issues when tasks go past midnight. Potentially migrate start_time to dt.datetime instead of dt.time
@router.get("/{task_id}/scheduled_end")
def get_scheduled_end_api(task_id: int) -> dt.time | None:
    if not check_task_exists(task_id):
        raise HTTPException(404, "The task with the specified id does not exist")
    task: FloatingTask = get_task_info(task_id)
    if task.scheduled_start is not None:
        start_time: dt.datetime = dt.datetime.combine(task.date, task.scheduled_start)
        duration: dt.timedelta = dt.timedelta(minutes=task.duration_minutes)
        end_time: dt.time = (start_time + duration).time()

        return end_time
    return None


# Changed so it has to have a date instead of relying on default date if no date supplied
# Also validating that the date is valid i.e. it is either the default date or one of the recurring dates.
# Loop that in once recurrence logic is complete
@router.put("/{task_id}/mark_complete")
def mark_task_complete_api(task_id: int, date: dt.date = Query(...)):
    if not check_task_exists(task_id):
        raise HTTPException(404, "The task with the specified id does not exist")
    completion_log_on_date: Sequence[CompletionLog] = get_completion_logs(task_id, date)
    if completion_log_on_date:
        raise HTTPException(422, "The specified task is already completed on that date")
    mark_task_complete(task_id, date)


# In the future potentially tighten and globalise wording such as 'incomplete'. Similar to fixed event, floating task
@router.put("/{task_id}/mark_incomplete")
def mark_task_incomplete_api(task_id: int, date: dt.date = Query(...)):
    if not check_task_exists(task_id):
        raise HTTPException(404, "The task with the specified id does not exist")
    completion_log_on_date: Sequence[CompletionLog] = get_completion_logs(task_id, date)
    if not completion_log_on_date:
        raise HTTPException(
            422, "The specified task is not already incomplete on that date"
        )
    mark_task_incomplete(task_id, date)


@router.get("/{task_id}/is_complete")
def is_task_complete_api(task_id: int, date: dt.date = Query(...)) -> bool:
    if not check_task_exists(task_id):
        raise HTTPException(404, "The task with the specified id does not exist")
    completion_log_on_date: Sequence[CompletionLog] = get_completion_logs(task_id, date)

    return len(completion_log_on_date) >= 1
