from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    key_result_id = Column(Integer, ForeignKey("key_results.id"), nullable=False, index=True)
    value = Column(Numeric, nullable=True)
    note = Column(Text, nullable=True)
    progress = Column(Numeric(5, 2), nullable=True)
    checkin_date = Column(Date, nullable=False, server_default=func.current_date())
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    key_result = relationship("KeyResult", back_populates="checkins")
