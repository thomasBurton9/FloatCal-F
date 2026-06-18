from typing import Literal

from fastapi import APIRouter, HTTPException, Query


from db.queries.item_db import (
    check_event_exists,
    check_task_exists,
    get_event_info,
    get_task_info,
)

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
