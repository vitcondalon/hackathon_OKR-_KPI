from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class KeyResultBase(BaseModel):
    title: str
    description: str | None = None
    metric_type: str | None = None
    start_value: Decimal = Decimal("0")
    target_value: Decimal
    current_value: Decimal = Decimal("0")
    status: str = "draft"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip().lower()
        if not value:
            raise ValueError("status is required")
        return value


class KeyResultCreate(KeyResultBase):
    objective_id: int = Field(..., gt=0)


class KeyResultUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    metric_type: str | None = None
    start_value: Decimal | None = None
    target_value: Decimal | None = None
    current_value: Decimal | None = None
    status: str | None = None
    objective_id: int | None = Field(default=None, gt=0)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip().lower()
        if not value:
            raise ValueError("status is required")
        return value


class KeyResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    metric_type: str | None = None
    start_value: Decimal
    target_value: Decimal
    current_value: Decimal
    status: str
    objective_id: int
    created_at: datetime
    updated_at: datetime
