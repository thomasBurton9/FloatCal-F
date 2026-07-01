import datetime as dt

from db.queries.calendar_db import (
    add_fixed_event,
    add_floating_task,
    add_member_to_calendar,
    check_calendar_exists,
    check_member_in_calendar,
    list_items_for_calendar_date,
    remove_member_from_calendar,
)
from db.queries.item_db import (
    check_event_exists,
    check_task_exists,
    remove_event,
    remove_task,
    update_fixed_event,
    update_floating_task,
)
from db.queries.user_db import check_user_exists
from fastapi import APIRouter, HTTPException
from schemas.item_schemas import (
    CreateFixedEvent,
    CreateFloatingTask,
    ItemType,
    UpdateFixedEvent,
    UpdateFloatingTask,
)

router = APIRouter(prefix="/api")


@router.get("/{calendar_id}/items")
def get_calendar_items_api(calendar_id: int, date: dt.date):
    # Maybe move all this logic into services/ to keep these functions clean
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "The calendar with that calendar_id does not exist")
    return list_items_for_calendar_date(calendar_id, date)


@router.delete("/remove_item/{calendar_id}/{item_id}")
def remove_item_api(calendar_id: int, item_id: int, item_type: ItemType):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "The calendar with that calendar_id does not exist")
    if item_type.item_type == "event":
        if not check_event_exists(item_id, calendar_id):
            raise HTTPException(404, "The event with the specified id does not exist")

        remove_event(calendar_id, item_id)
    else:
        if not check_task_exists(item_id, calendar_id):
            raise HTTPException(404, "The task with the specified id does not exist")

        remove_task(calendar_id, item_id)


@router.post("/{calendar_id}/events")
def add_event_api(calendar_id: int, event_data: CreateFixedEvent):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    add_fixed_event(calendar_id, event_data)


@router.post("/{calendar_id}/tasks")
def add_task_api(calendar_id: int, task_data: CreateFloatingTask):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    add_floating_task(calendar_id, task_data)


@router.patch("/{calendar_id}/events/{event_id}")
def update_event_api(calendar_id: int, event_id: int, event_data: UpdateFixedEvent):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    if not check_event_exists(event_id, calendar_id):
        raise HTTPException(404, "The event with the specified id does not exist")

    try:
        update_fixed_event(calendar_id, event_id, event_data)
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.patch("/{calendar_id}/tasks/{task_id}")
def update_task_api(calendar_id: int, task_id: int, task_data: UpdateFloatingTask):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    if not check_task_exists(task_id, calendar_id):
        raise HTTPException(404, "The task with the specified id does not exist")

    update_floating_task(calendar_id, task_id, task_data)


@router.post("/add_member/{calendar_id}/{user_id}")
def add_member_api(calendar_id: int, user_id: int):
    # Check if user_id is not in calendar
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")
    if check_member_in_calendar(calendar_id, user_id):
        raise HTTPException(
            409, "User with the user_id is already in the Calendar with calendar_id"
        )

    add_member_to_calendar(calendar_id, user_id)


@router.delete("/remove_member/{calendar_id}/{user_id}")
def remove_member_api(calendar_id: int, user_id: int):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")
    if not check_member_in_calendar(calendar_id, user_id):
        raise HTTPException(
            404, "User with the user_id is not in the Calendar with the calendar_id"
        )

    remove_member_from_calendar(calendar_id, user_id)
