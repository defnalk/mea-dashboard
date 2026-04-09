"""Pydantic schemas for AlarmEvent."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlarmRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    run_id: uuid.UUID
    sensor_name: str
    alarm_type: str
    threshold_value: float
    actual_value: float
    triggered_at: datetime
    message: str


class AlarmStats(BaseModel):
    total: int
    by_sensor: dict[str, int]
    by_type: dict[str, int]
