"""Pydantic schemas for SensorReading."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReadingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    run_id: uuid.UUID
    timestamp: datetime
    sensor_name: str
    value: float
    unit: str


class ReadingPoint(BaseModel):
    """Lightweight downsampled point used by chart endpoints."""

    timestamp: datetime
    sensor_name: str
    value: float
    unit: str


class LatestReading(BaseModel):
    sensor_name: str
    timestamp: datetime
    value: float
    unit: str
