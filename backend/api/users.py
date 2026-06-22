from fastapi import APIRouter, HTTPException

from db.queries.calendar_db import create_calendar
from db.queries.user_db import check_user_exists, get_user_calendars
from schemas.calendar_schemas import CreateCalendar

router = APIRouter(prefix="/api")


@router.get("/{user_id}/calendars")
def get_user_calendars_api(user_id: int):
    if not check_user_exists(user_id):
        raise HTTPException(422, "User with specified user_id does not exist")

    return get_user_calendars(user_id)


@router.post("/{user_id}/create_calendar")
def create_calendar_api(user_id: int, data: CreateCalendar):
    if not check_user_exists(user_id):
        raise HTTPException(
            422, "User with specified user_id does not exist"
        )  # Exception code and messages could be unified/organised systematically in the future

    # Also adds the user to the calendar immediately
    create_calendar(user_id, data)
