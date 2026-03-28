from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.cycle import Cycle
from app.models.objective import Objective
from app.models.user import User
from app.schemas.objective import ObjectiveCreate, ObjectiveResponse, ObjectiveUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/objectives", tags=["objectives"])


@router.get("", response_model=list[ObjectiveResponse])
def list_objectives(
    owner_id: int | None = None,
    cycle_id: int | None = None,
    objective_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Objective)

    if owner_id is not None:
        query = query.filter(Objective.owner_id == owner_id)

    if cycle_id is not None:
        query = query.filter(Objective.cycle_id == cycle_id)

    if objective_status is not None:
        query = query.filter(Objective.status == objective_status.strip().lower())

    return query.order_by(Objective.id.asc()).all()


@router.get("/{objective_id}", response_model=ObjectiveResponse)
def get_objective(
    objective_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    objective = db.query(Objective).filter(Objective.id == objective_id).first()
    if objective is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Objective not found",
        )

    return objective


@router.post("", response_model=ObjectiveResponse, status_code=status.HTTP_201_CREATED)
def create_objective(
    payload: ObjectiveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == payload.owner_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner user not found",
        )

    cycle = db.query(Cycle).filter(Cycle.id == payload.cycle_id).first()
    if cycle is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cycle not found",
        )

    objective = Objective(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        owner_id=payload.owner_id,
        cycle_id=payload.cycle_id,
        progress=payload.progress,
    )
    db.add(objective)
    db.commit()
    db.refresh(objective)
    return objective


@router.put("/{objective_id}", response_model=ObjectiveResponse)
def update_objective(
    objective_id: int,
    payload: ObjectiveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    objective = db.query(Objective).filter(Objective.id == objective_id).first()
    if objective is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Objective not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    required_fields = {"title", "status", "progress", "owner_id", "cycle_id"}
    for field in required_fields:
        if field in updates and updates[field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} cannot be null",
            )

    if "owner_id" in updates:
        user = db.query(User).filter(User.id == updates["owner_id"]).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner user not found",
            )

    if "cycle_id" in updates:
        cycle = db.query(Cycle).filter(Cycle.id == updates["cycle_id"]).first()
        if cycle is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cycle not found",
            )

    for field, value in updates.items():
        setattr(objective, field, value)

    db.commit()
    db.refresh(objective)
    return objective


@router.delete("/{objective_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_objective(
    objective_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    objective = db.query(Objective).filter(Objective.id == objective_id).first()
    if objective is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Objective not found",
        )

    db.delete(objective)
    db.commit()
