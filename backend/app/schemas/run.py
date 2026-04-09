"""Pydantic schemas for PlantRun."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RunBase(BaseModel):
    name: str
    description: str | None = None


class RunCreate(RunBase):
    pass


class RunRead(RunBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    uploaded_at: datetime
    start_time: datetime | None
    end_time: datetime | None
    reading_count: int
    alarm_count: int


class RunSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    uploaded_at: datetime
    reading_count: int
    alarm_count: int
    duration_seconds: float | None
