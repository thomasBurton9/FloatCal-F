from fastapi import APIRouter, HTTPException

from db.queries.user_db import check_user_exists, create_user, delete_user
from schemas.user_schemas import CreateUser, DeleteUser

router = APIRouter(prefix="/api")


@router.post("/authentication/create_user")
def create_user_api(data: CreateUser):
    try:
        success: bool = create_user(data)
        return success
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


def authenticate_user_api():
    pass
