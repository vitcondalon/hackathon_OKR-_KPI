from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.routers.auth import router as auth_router
from app.routers.checkins import router as checkins_router
from app.routers.cycles import router as cycles_router
from app.routers.dashboard import router as dashboard_router
from app.routers.departments import router as departments_router
from app.routers.key_results import router as key_results_router
from app.routers.objectives import router as objectives_router
from app.routers.users import router as users_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.APP_DEBUG,
)

init_db()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(departments_router)
app.include_router(users_router)
app.include_router(cycles_router)
app.include_router(objectives_router)
app.include_router(key_results_router)
app.include_router(checkins_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }
