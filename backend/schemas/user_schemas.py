from typing import Annotated

from pydantic import BaseModel, Field


class CreateUser(BaseModel):
    email: Annotated[str, Field(min_length=4, max_length=126)]

    password: str
    display_name: Annotated[str, Field(min_length=3, max_length=24)]


class DeleteUser(BaseModel):
    email: Annotated[str, Field(min_length=4, max_length=126)]
    password: str
