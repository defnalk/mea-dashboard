"""Alarm event endpoints."""
from __future__ import annotations

import uuid
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AlarmEvent
from app.schemas.alarm import AlarmRead, AlarmStats

router = APIRouter()


@router.get("/{run_id}/alarms", response_model=list[AlarmRead])
async def list_alarms(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[AlarmEvent]:
    stmt = (
        select(AlarmEvent)
        .where(AlarmEvent.run_id == run_id)
        .order_by(AlarmEvent.triggered_at.asc())
    )
    return list((await db.execute(stmt)).scalars().all())


@router.get("/{run_id}/alarms/stats", response_model=AlarmStats)
async def alarm_stats(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> AlarmStats:
    rows = (
        await db.execute(select(AlarmEvent).where(AlarmEvent.run_id == run_id))
    ).scalars().all()
    by_sensor = Counter(r.sensor_name for r in rows)
    by_type = Counter(r.alarm_type for r in rows)
    return AlarmStats(total=len(rows), by_sensor=dict(by_sensor), by_type=dict(by_type))
