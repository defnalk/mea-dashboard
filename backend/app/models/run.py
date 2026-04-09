"""PlantRun ORM model — a single session of uploaded sensor data."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.alarm import AlarmEvent
    from app.models.reading import SensorReading


class PlantRun(Base):
    __tablename__ = "plant_runs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reading_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    alarm_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    readings: Mapped[list[SensorReading]] = relationship(
        back_populates="run", cascade="all, delete-orphan", passive_deletes=True
    )
    alarms: Mapped[list[AlarmEvent]] = relationship(
        back_populates="run", cascade="all, delete-orphan", passive_deletes=True
    )
