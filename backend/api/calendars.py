from fastapi import APIRouter, HTTPException
import datetime as dt
from db.queries.calendar_db import (
    add_fixed_event,
    add_floating_task,
    check_calendar_exists,
    list_items_for_calendar_date,
)
from schemas.item_schemas import CreateFixedEvent, CreateFloatingTask

router = APIRouter(prefix="/api")


@router.get("/{calendar_id}/items")
def get_calendar_items(calendar_id: int, date: dt.date):
    # Maybe move all this logic into services/ to keep these functions clean
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "The calendar with that calendar_id does not exist")
    return list_items_for_calendar_date(calendar_id, date)


@router.post("/{calendar_id}/events")
def add_calendar_event(calendar_id: int, event_data: CreateFixedEvent):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    add_fixed_event(calendar_id, event_data)


@router.post("/{calendar_id}/tasks")
def add_task(calendar_id: int, task_data: CreateFloatingTask):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "calendar_id does not exist")
    add_floating_task(calendar_id, task_data)
