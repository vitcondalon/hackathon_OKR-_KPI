from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Objective(Base):
    __tablename__ = "objectives"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="draft")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    cycle_id = Column(Integer, ForeignKey("cycles.id"), nullable=False, index=True)
    progress = Column(Numeric(5, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner = relationship("User", back_populates="objectives")
    cycle = relationship("Cycle", back_populates="objectives")
    key_results = relationship(
        "KeyResult",
        back_populates="objective",
        cascade="all, delete-orphan",
    )
