"""AlarmEvent ORM model — triggered alarm record."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.run import PlantRun


class AlarmEvent(Base):
    __tablename__ = "alarm_events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        ForeignKey("plant_runs.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    reading_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("sensor_readings.id", ondelete="SET NULL"), nullable=True
    )
    sensor_name: Mapped[str] = mapped_column(String(50), nullable=False)
    alarm_type: Mapped[str] = mapped_column(String(20), nullable=False)
    threshold_value: Mapped[float] = mapped_column(Float, nullable=False)
    actual_value: Mapped[float] = mapped_column(Float, nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    run: Mapped[PlantRun] = relationship(back_populates="alarms")
