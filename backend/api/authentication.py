from fastapi import APIRouter, HTTPException

from db.queries.user_db import (
    authenticate_user,
    check_user_exists,
    create_user,
    delete_user,
    get_user_info,
    list_users_public,
)
from schemas.user_schemas import CreateUser, DeleteUser, UserInfo, UserLogin

router = APIRouter(prefix="/api")


@router.post("/authentication/create_user")
def create_user_api(data: CreateUser):
    try:
        user_id: int = create_user(data)
        return user_id
    except ValueError as e:
        raise HTTPException(422, str(e))


# Require explicit password authentication to delete user
@router.delete("/authentication/{user_id}/delete_user")
def delete_user_api(user_id: int, data: DeleteUser):
    if not check_user_exists(user_id):
        raise HTTPException(422, "User with specified user_id does not exist")

    try:
        success: bool = delete_user(user_id, data)
        return success
    except ValueError as e:
        raise HTTPException(422, str(e))


# Currently does not do much except validate the logic
@router.post("/authentication/login")
def authenticate_user_api(data: UserLogin):
    try:
        user_id: int = authenticate_user(data)
        return user_id
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.get(
    "/authentication/{user_id}/user_info", response_model=UserInfo
)  # Inform docs that the response has a certain shape (UserInfo shape)
def get_user_info_api(user_id: int):
    if not check_user_exists(user_id):
        raise HTTPException(422, "User with specified user_id does not exist")

    try:
        user_info: UserInfo = get_user_info(user_id)
        return user_info
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.get("/list_users", response_model=list[UserInfo])
def list_users_public_api():
    return list_users_public()
