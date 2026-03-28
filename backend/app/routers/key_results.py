from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.key_result import KeyResult
from app.models.objective import Objective
from app.models.user import User
from app.schemas.key_result import KeyResultCreate, KeyResultResponse, KeyResultUpdate
from app.utils.deps import get_current_user
from app.utils.progress import sync_objective_progress

router = APIRouter(prefix="/key-results", tags=["key_results"])


@router.get("", response_model=list[KeyResultResponse])
def list_key_results(
    objective_id: int | None = None,
    key_result_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(KeyResult)

    if objective_id is not None:
        query = query.filter(KeyResult.objective_id == objective_id)

    if key_result_status is not None:
        query = query.filter(KeyResult.status == key_result_status.strip().lower())

    return query.order_by(KeyResult.id.asc()).all()


@router.get("/{key_result_id}", response_model=KeyResultResponse)
def get_key_result(
    key_result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key_result = db.query(KeyResult).filter(KeyResult.id == key_result_id).first()
    if key_result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Key result not found",
        )

    return key_result


@router.post("", response_model=KeyResultResponse, status_code=status.HTTP_201_CREATED)
def create_key_result(
    payload: KeyResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    objective = db.query(Objective).filter(Objective.id == payload.objective_id).first()
    if objective is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Objective not found",
        )

    key_result = KeyResult(
        title=payload.title,
        description=payload.description,
        metric_type=payload.metric_type,
        start_value=payload.start_value,
        target_value=payload.target_value,
        current_value=payload.current_value,
        status=payload.status,
        objective_id=payload.objective_id,
    )
    db.add(key_result)
    db.commit()
    sync_objective_progress(db, key_result.objective_id)
    db.commit()
    db.refresh(key_result)
    return key_result


@router.put("/{key_result_id}", response_model=KeyResultResponse)
def update_key_result(
    key_result_id: int,
    payload: KeyResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key_result = db.query(KeyResult).filter(KeyResult.id == key_result_id).first()
    if key_result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Key result not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    required_fields = {
        "title",
        "start_value",
        "target_value",
        "current_value",
        "status",
        "objective_id",
    }
    for field in required_fields:
        if field in updates and updates[field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} cannot be null",
            )

    if "objective_id" in updates:
        objective = db.query(Objective).filter(Objective.id == updates["objective_id"]).first()
        if objective is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Objective not found",
            )

    previous_objective_id = key_result.objective_id

    for field, value in updates.items():
        setattr(key_result, field, value)

    db.commit()
    sync_objective_progress(db, key_result.objective_id)
    if previous_objective_id != key_result.objective_id:
        sync_objective_progress(db, previous_objective_id)
    db.commit()
    db.refresh(key_result)
    return key_result


@router.delete("/{key_result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_key_result(
    key_result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key_result = db.query(KeyResult).filter(KeyResult.id == key_result_id).first()
    if key_result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Key result not found",
        )

    objective_id = key_result.objective_id
    db.delete(key_result)
    db.commit()
    sync_objective_progress(db, objective_id)
    db.commit()
