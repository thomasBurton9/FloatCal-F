import datetime as dt
from typing import Literal

from fastapi import APIRouter, HTTPException, Query


from db.models.items import FixedEvent, FloatingTask
from db.queries.item_db import (
    check_event_exists,
    check_task_exists,
    get_event_info,
    get_task_info,
)
from db.queries.reminder_db import get_event_reminders, get_task_reminders

router = APIRouter(prefix="/api")


# Request in the form of /api/{item_id}/info?item_type=event
@router.get("/{item_id}/info")
def get_item_info(item_id: int, item_type: Literal["event", "task"] = Query(...)):
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
def get_calendar_of_item(
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
def is_item_recurring(item_id: int, item_type: Literal["event", "task"] = Query(...)):
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
def get_item_reminders(item_id: int, item_type: Literal["event", "task"] = Query(...)):
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
def get_event_duration(event_id: int) -> float:
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
def get_scheduling_status(task_id: int) -> bool:
    if not check_task_exists(task_id):
        raise HTTPException(404, "The task with the specified id does not exist")
    task: FloatingTask = get_task_info(task_id)
    return task.scheduled_start is not None
