from fastapi import APIRouter, HTTPException

from db.queries.user_db import check_user_exists, get_user_calendars

router = APIRouter(prefix="/api")


@router.get("/{user_id}/calendars")
def get_user_calendars_api(user_id: int):
    if not check_user_exists(user_id):
        raise HTTPException(422, "User with specified user_id does not exist")

    return get_user_calendars(user_id)
