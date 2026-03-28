from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CheckinBase(BaseModel):
    value: Decimal | None = None
    note: str | None = None
    progress: Decimal | None = None
    checkin_date: date | None = None

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and (value < 0 or value > 100):
            raise ValueError("progress must be between 0 and 100")
        return value


class CheckinCreate(CheckinBase):
    key_result_id: int = Field(..., gt=0)


class CheckinUpdate(CheckinBase):
    key_result_id: int | None = Field(default=None, gt=0)


class CheckinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key_result_id: int
    value: Decimal | None = None
    note: str | None = None
    progress: Decimal | None = None
    checkin_date: date
    created_at: datetime
