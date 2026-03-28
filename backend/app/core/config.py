from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_JWT_SECRET = "change_me_to_a_long_random_secret"


class Settings(BaseSettings):
    APP_NAME: str = "OKR KPI HR System"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_DEBUG: bool = False
    APP_VERSION: str = "1.0.0"

    DATABASE_URL: str = "sqlite:///./test.db"
    BACKEND_CORS_ORIGINS: str = ",".join(
        [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://192.168.32.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ]
    )

    JWT_SECRET_KEY: str = DEFAULT_JWT_SECRET
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ADMIN_SEED_FULL_NAME: str = "Admin"
    ADMIN_SEED_EMAIL: str = "admin@gmail.com"
    ADMIN_SEED_PASSWORD: str = "123456"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.rstrip("/")
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    def validate_production_settings(self) -> None:
        if self.APP_ENV.lower() != "production":
            return

        if self.APP_DEBUG:
            raise ValueError("APP_DEBUG must be false in production.")

        if self.JWT_SECRET_KEY == DEFAULT_JWT_SECRET:
            raise ValueError("JWT_SECRET_KEY must be changed in production.")

        if not self.cors_origins:
            raise ValueError("BACKEND_CORS_ORIGINS must include at least one origin in production.")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_production_settings()
    return settings
