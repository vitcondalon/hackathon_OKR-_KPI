from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "employee"

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        role = value.strip().lower()
        if role not in {"admin", "manager", "employee"}:
            raise ValueError("role must be admin, manager, or employee")
        return role


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None
    is_active: bool | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str | None) -> str | None:
        if value is None:
            return value
        role = value.strip().lower()
        if role not in {"admin", "manager", "employee"}:
            raise ValueError("role must be admin, manager, or employee")
        return role


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool


class CurrentUserResponse(UserResponse):
    pass
