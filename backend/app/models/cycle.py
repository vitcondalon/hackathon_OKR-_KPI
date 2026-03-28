from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="draft")

    objectives = relationship("Objective", back_populates="cycle")
