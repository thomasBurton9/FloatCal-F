from typing import Annotated

from pydantic import BaseModel, Field


class CreateCalendar(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=16)]
    # 8 digit hexcode #RRGGBBAA
    # Potentially make the checks more strict
    colour: Annotated[str, Field(min_length=9, max_length=9)]


class UpdateCalendar(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=16)] = None  # type: ignore[assignment]
    colour: Annotated[str, Field(min_length=9, max_length=9)] = None  # type: ignore[assignment]
