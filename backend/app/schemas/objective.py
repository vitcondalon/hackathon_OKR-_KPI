from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ObjectiveBase(BaseModel):
    title: str
    description: str | None = None
    status: str = "draft"
    progress: Decimal = Decimal("0")

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, value: Decimal) -> Decimal:
        if value < 0 or value > 100:
            raise ValueError("progress must be between 0 and 100")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip().lower()
        if not value:
            raise ValueError("status is required")
        return value


class ObjectiveCreate(ObjectiveBase):
    owner_id: int = Field(..., gt=0)
    cycle_id: int = Field(..., gt=0)


class ObjectiveUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    progress: Decimal | None = None
    owner_id: int | None = Field(default=None, gt=0)
    cycle_id: int | None = Field(default=None, gt=0)

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and (value < 0 or value > 100):
            raise ValueError("progress must be between 0 and 100")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip().lower()
        if not value:
            raise ValueError("status is required")
        return value


class ObjectiveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    status: str
    owner_id: int
    cycle_id: int
    progress: Decimal
    created_at: datetime
    updated_at: datetime
