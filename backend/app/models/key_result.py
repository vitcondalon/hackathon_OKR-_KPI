from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class KeyResult(Base):
    __tablename__ = "key_results"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    metric_type = Column(String, nullable=True)
    start_value = Column(Numeric, nullable=False, default=0)
    target_value = Column(Numeric, nullable=False)
    current_value = Column(Numeric, nullable=False, default=0)
    status = Column(String, nullable=False, default="draft")
    objective_id = Column(Integer, ForeignKey("objectives.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    objective = relationship("Objective", back_populates="key_results")
    checkins = relationship(
        "Checkin",
        back_populates="key_result",
        cascade="all, delete-orphan",
    )
