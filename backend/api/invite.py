from fastapi import APIRouter, HTTPException

from db.queries.calendar_db import check_calendar_exists
from db.queries.invite_db import (
    get_invites_for_calendar,
    get_invites_from_user,
    get_invites_to_user,
    get_invites_to_user_info,
    invite_user_to_calendar,
    respond_to_invite,
)
from db.queries.user_db import check_user_exists

router = APIRouter(prefix="/api")


@router.post("/invite_user/{user_invite_from_id}/{user_to_invite_id}/{calendar_id}")
def invite_user_to_calendar_api(
    user_invite_from_id: int, user_to_invite_id: int, calendar_id: int
):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "The calendar with that calendar_id does not exist")
    if not check_user_exists(user_invite_from_id):
        raise HTTPException(404, "user_id does not exist")
    if not check_user_exists(user_to_invite_id):
        raise HTTPException(404, "user_id does not exist")

    try:
        return invite_user_to_calendar(
            user_invite_from_id, user_to_invite_id, calendar_id
        )
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.put("/respond_to_invite/{user_id}/{invite_id}")
def respond_to_invite_api(user_id: int, invite_id: int, accepted: bool):
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")

    try:
        return respond_to_invite(user_id, invite_id, accepted)
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.get("/{user_id}/invites_to_user")
def get_invites_to_user_api(user_id: int):
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")

    return get_invites_to_user(user_id)


@router.get("/{user_id}/invites_to_user_info")
def get_invites_to_user_info_api(user_id: int):
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")

    return get_invites_to_user_info(user_id)


# potentially not needed by frontend
@router.get("/{user_id}/invites_from_user")
def get_invites_from_user_api(user_id: int):
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")

    return get_invites_from_user(user_id)


@router.get("/{user_id}/{calendar_id}/invites_for_calendar")
def get_invite_by_calendar_api(user_id: int, calendar_id: int):
    if not check_calendar_exists(calendar_id):
        raise HTTPException(404, "The calendar with that calendar_id does not exist")
    if not check_user_exists(user_id):
        raise HTTPException(404, "user_id does not exist")

    try:
        return get_invites_for_calendar(user_id, calendar_id)
    except ValueError as e:
        raise HTTPException(422, str(e))
