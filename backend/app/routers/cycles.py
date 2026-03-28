from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.cycle import Cycle
from app.models.user import User
from app.schemas.cycle import CycleCreate, CycleResponse, CycleUpdate
from app.utils.deps import get_current_user, require_admin_or_manager

router = APIRouter(prefix="/cycles", tags=["cycles"])


@router.get("", response_model=list[CycleResponse])
def list_cycles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Cycle).order_by(Cycle.id.asc()).all()


@router.post("", response_model=CycleResponse, status_code=status.HTTP_201_CREATED)
def create_cycle(
    payload: CycleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be on or after start_date",
        )

    cycle = Cycle(
        name=payload.name,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/{cycle_id}", response_model=CycleResponse)
def get_cycle(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id).first()
    if cycle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cycle not found",
        )

    return cycle


@router.put("/{cycle_id}", response_model=CycleResponse)
def update_cycle(
    cycle_id: int,
    payload: CycleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id).first()
    if cycle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cycle not found",
        )

    updates = payload.model_dump(exclude_unset=True)
    start_date = updates.get("start_date", cycle.start_date)
    end_date = updates.get("end_date", cycle.end_date)
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be on or after start_date",
        )

    for field, value in updates.items():
        setattr(cycle, field, value)

    db.commit()
    db.refresh(cycle)
    return cycle


@router.delete("/{cycle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cycle(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id).first()
    if cycle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cycle not found",
        )

    db.delete(cycle)
    db.commit()
