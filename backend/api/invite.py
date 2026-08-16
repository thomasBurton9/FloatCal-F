from fastapi import APIRouter

router = APIRouter(prefix="/api")


def invite_user_to_calendar_api():
    raise NotImplementedError


def respond_to_invite_api():
    raise NotImplementedError


def get_invites_to_user_api():
    raise NotImplementedError


# potentiall not needed by frontend
def get_invites_from_user_api():
    raise NotImplementedError


def get_invite_by_calendar_api():
    raise NotImplementedError
