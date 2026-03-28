from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.checkin import Checkin
from app.models.key_result import KeyResult
from app.models.user import User
from app.schemas.checkin import CheckinCreate, CheckinResponse, CheckinUpdate
from app.utils.deps import get_current_user
from app.utils.progress import sync_key_result_current_value, sync_objective_progress

router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.get("", response_model=list[CheckinResponse])
def list_checkins(
    key_result_id: int | None = None,
    latest_first: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Checkin)

    if key_result_id is not None:
        query = query.filter(Checkin.key_result_id == key_result_id)

    if latest_first:
        return query.order_by(Checkin.checkin_date.desc(), Checkin.id.desc()).all()

    return query.order_by(Checkin.checkin_date.asc(), Checkin.id.asc()).all()


@router.get("/{checkin_id}", response_model=CheckinResponse)
def get_checkin(
    checkin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    checkin = db.query(Checkin).filter(Checkin.id == checkin_id).first()
    if checkin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkin not found",
        )

    return checkin


@router.post("", response_model=CheckinResponse, status_code=status.HTTP_201_CREATED)
def create_checkin(
    payload: CheckinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key_result = db.query(KeyResult).filter(KeyResult.id == payload.key_result_id).first()
    if key_result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Key result not found",
        )

    checkin = Checkin(
        key_result_id=payload.key_result_id,
        value=payload.value,
        note=payload.note,
        progress=payload.progress,
    )
    if payload.checkin_date is not None:
        checkin.checkin_date = payload.checkin_date

    db.add(checkin)
    db.commit()
    sync_key_result_current_value(db, checkin.key_result_id)
    sync_objective_progress(db, key_result.objective_id)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.put("/{checkin_id}", response_model=CheckinResponse)
def update_checkin(
    checkin_id: int,
    payload: CheckinUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    checkin = db.query(Checkin).filter(Checkin.id == checkin_id).first()
    if checkin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkin not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    required_fields = {"key_result_id", "checkin_date"}
    for field in required_fields:
        if field in updates and updates[field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} cannot be null",
            )

    previous_key_result_id = checkin.key_result_id

    if "key_result_id" in updates:
        key_result = db.query(KeyResult).filter(KeyResult.id == updates["key_result_id"]).first()
        if key_result is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Key result not found",
            )

    for field, value in updates.items():
        setattr(checkin, field, value)

    db.commit()
    sync_key_result_current_value(db, checkin.key_result_id)
    current_key_result = db.query(KeyResult).filter(KeyResult.id == checkin.key_result_id).first()
    if current_key_result is not None:
        sync_objective_progress(db, current_key_result.objective_id)
    if previous_key_result_id != checkin.key_result_id:
        sync_key_result_current_value(db, previous_key_result_id)
        previous_key_result = db.query(KeyResult).filter(KeyResult.id == previous_key_result_id).first()
        if previous_key_result is not None:
            sync_objective_progress(db, previous_key_result.objective_id)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.delete("/{checkin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checkin(
    checkin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    checkin = db.query(Checkin).filter(Checkin.id == checkin_id).first()
    if checkin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkin not found",
        )

    key_result_id = checkin.key_result_id
    db.delete(checkin)
    db.commit()
    sync_key_result_current_value(db, key_result_id)
    key_result = db.query(KeyResult).filter(KeyResult.id == key_result_id).first()
    if key_result is not None:
        sync_objective_progress(db, key_result.objective_id)
        db.commit()
