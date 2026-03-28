from app.core.database import SessionLocal, init_db
from app.core.config import get_settings
from app.core.security import hash_password
from app.models import User

settings = get_settings()


def main() -> None:
    init_db()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.ADMIN_SEED_EMAIL).first()
        if user is None:
            user = User(
                full_name=settings.ADMIN_SEED_FULL_NAME,
                email=settings.ADMIN_SEED_EMAIL,
                password_hash=hash_password(settings.ADMIN_SEED_PASSWORD),
                role="admin",
                is_active=True,
            )
            db.add(user)
            db.commit()
            print(f"Admin user created: {settings.ADMIN_SEED_EMAIL}")
        else:
            print(f"Admin user already exists: {settings.ADMIN_SEED_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
