from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models.checkin import Checkin
from app.models.key_result import KeyResult
from app.models.objective import Objective

HUNDRED = Decimal("100")
ZERO = Decimal("0")


def _quantize_progress(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_key_result_progress(key_result: KeyResult) -> Decimal:
    start_value = Decimal(key_result.start_value or 0)
    target_value = Decimal(key_result.target_value or 0)
    current_value = Decimal(key_result.current_value or 0)

    total_delta = target_value - start_value
    if total_delta == 0:
        return HUNDRED if current_value >= target_value else ZERO

    progress = ((current_value - start_value) / total_delta) * HUNDRED
    if progress < ZERO:
        return ZERO
    if progress > HUNDRED:
        return HUNDRED
    return _quantize_progress(progress)


def sync_objective_progress(db: Session, objective_id: int) -> None:
    objective = db.query(Objective).filter(Objective.id == objective_id).first()
    if objective is None:
        return

    key_results = db.query(KeyResult).filter(KeyResult.objective_id == objective_id).all()
    if not key_results:
        objective.progress = ZERO
        return

    total_progress = sum(calculate_key_result_progress(item) for item in key_results)
    objective.progress = _quantize_progress(total_progress / Decimal(len(key_results)))


def sync_key_result_current_value(db: Session, key_result_id: int) -> None:
    key_result = db.query(KeyResult).filter(KeyResult.id == key_result_id).first()
    if key_result is None:
        return

    latest_checkin = (
        db.query(Checkin)
        .filter(Checkin.key_result_id == key_result_id, Checkin.value.isnot(None))
        .order_by(Checkin.checkin_date.desc(), Checkin.id.desc())
        .first()
    )

    key_result.current_value = (
        latest_checkin.value if latest_checkin is not None else key_result.start_value
    )
