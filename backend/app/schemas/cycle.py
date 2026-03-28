from datetime import date

from pydantic import BaseModel, ConfigDict, field_validator


class CycleCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip().lower()
        if not value:
            raise ValueError("status is required")
        return value


class CycleUpdate(BaseModel):
    name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip().lower()
        if not value:
            raise ValueError("status is required")
        return value


class CycleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    start_date: date
    end_date: date
    status: str
