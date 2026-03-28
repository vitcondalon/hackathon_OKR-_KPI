from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.department import Department
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentResponse, DepartmentUpdate
from app.utils.deps import get_current_user, require_admin

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentResponse])
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Department).order_by(Department.id.asc()).all()


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing_department = db.query(Department).filter(Department.name == payload.name).first()
    if existing_department is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name already exists",
        )

    department = Department(name=payload.name, description=payload.description)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return department


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    if "name" in updates:
        existing_department = (
            db.query(Department)
            .filter(Department.name == updates["name"], Department.id != department_id)
            .first()
        )
        if existing_department is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department name already exists",
            )

    for field, value in updates.items():
        setattr(department, field, value)

    db.commit()
    db.refresh(department)
    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    db.delete(department)
    db.commit()
