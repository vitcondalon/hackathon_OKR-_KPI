from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

settings = get_settings()

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def reset_sqlite_db() -> bool:
    if not is_sqlite or not settings.DATABASE_URL.startswith("sqlite:///./"):
        return False

    db_path = Path(settings.DATABASE_URL.replace("sqlite:///./", "", 1))
    if db_path.exists():
        db_path.unlink()
    return True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
