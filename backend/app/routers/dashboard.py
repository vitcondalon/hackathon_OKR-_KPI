from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.checkin import Checkin
from app.models.cycle import Cycle
from app.models.department import Department
from app.models.key_result import KeyResult
from app.models.objective import Objective
from app.models.user import User
from app.schemas.dashboard import (
    DashboardChartItem,
    DashboardProgressResponse,
    DashboardRiskItem,
    DashboardStatusItem,
    DashboardSummaryResponse,
    DashboardTopPerformerItem,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _to_float(value: Decimal | float | int | None) -> float:
    if value is None:
        return 0.0
    return round(float(value), 2)


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    average_progress = db.query(func.avg(Objective.progress)).scalar()
    return DashboardSummaryResponse(
        total_users=db.query(func.count(User.id)).scalar() or 0,
        total_departments=db.query(func.count(Department.id)).scalar() or 0,
        total_objectives=db.query(func.count(Objective.id)).scalar() or 0,
        total_key_results=db.query(func.count(KeyResult.id)).scalar() or 0,
        total_checkins=db.query(func.count(Checkin.id)).scalar() or 0,
        average_objective_progress=_to_float(average_progress),
    )


@router.get("/progress", response_model=DashboardProgressResponse)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    average_progress = db.query(func.avg(Objective.progress)).scalar()
    status_rows = (
        db.query(Objective.status, func.count(Objective.id))
        .group_by(Objective.status)
        .order_by(Objective.status.asc())
        .all()
    )

    return DashboardProgressResponse(
        average_objective_progress=_to_float(average_progress),
        objective_counts_by_status=[
            DashboardStatusItem(status=status or "unknown", count=count)
            for status, count in status_rows
        ],
    )


@router.get("/risks", response_model=list[DashboardRiskItem])
def get_risks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    objectives = db.query(Objective).all()
    risk_buckets = {"high": 0, "medium": 0, "low": 0}

    for objective in objectives:
        progress = _to_float(objective.progress)
        if progress < 40:
            risk_buckets["high"] += 1
        elif progress < 70:
            risk_buckets["medium"] += 1
        else:
            risk_buckets["low"] += 1

    return [
        DashboardRiskItem(risk_level=level, count=count)
        for level, count in risk_buckets.items()
    ]


@router.get("/top-performers", response_model=list[DashboardTopPerformerItem])
def get_top_performers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            User.id,
            User.full_name,
            func.avg(Objective.progress).label("average_progress"),
            func.count(Objective.id).label("objective_count"),
        )
        .join(Objective, Objective.owner_id == User.id)
        .group_by(User.id, User.full_name)
        .order_by(func.avg(Objective.progress).desc(), func.count(Objective.id).desc())
        .limit(5)
        .all()
    )

    return [
        DashboardTopPerformerItem(
            user_id=user_id,
            full_name=full_name,
            average_progress=_to_float(average_progress),
            objective_count=objective_count,
        )
        for user_id, full_name, average_progress, objective_count in rows
    ]


@router.get("/charts", response_model=list[DashboardChartItem])
def get_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cycle_rows = (
        db.query(
            Cycle.name,
            func.count(Objective.id).label("objective_count"),
            func.avg(Objective.progress).label("average_progress"),
        )
        .outerjoin(Objective, Objective.cycle_id == Cycle.id)
        .group_by(Cycle.id, Cycle.name)
        .order_by(Cycle.start_date.asc(), Cycle.id.asc())
        .all()
    )

    return [
        DashboardChartItem(
            label=name,
            objectives=objective_count,
            average_progress=_to_float(average_progress),
        )
        for name, objective_count, average_progress in cycle_rows
    ]
