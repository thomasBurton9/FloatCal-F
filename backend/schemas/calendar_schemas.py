from typing import Annotated

from pydantic import BaseModel, Field


# API schema that automatically validates the length of the name of a calendar, and that the colour is off the correct length
class CreateCalendar(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=16)]
    # 8 digit hexcode #RRGGBBAA
    # Potentially make the checks more strict
    colour: Annotated[str, Field(min_length=9, max_length=9)]


# API schema that automatically validates the length of the name of a calendar, and that the colour is off the correct length, all fields don't have to be returned
class UpdateCalendar(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=16)] = None  # type: ignore[assignment]
    colour: Annotated[str, Field(min_length=9, max_length=9)] = None  # type: ignore[assignment]
