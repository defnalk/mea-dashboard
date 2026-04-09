"""Sensor readings query endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import SensorReading
from app.schemas.reading import LatestReading, ReadingPoint

router = APIRouter()

Resolution = Literal["raw", "1min", "5min", "15min"]
_BUCKET_SECONDS: dict[str, int] = {"1min": 60, "5min": 300, "15min": 900}


@router.get("/{run_id}/readings", response_model=list[ReadingPoint])
async def list_readings(
    run_id: uuid.UUID,
    sensor: list[str] | None = Query(None),
    start: datetime | None = None,
    end: datetime | None = None,
    resolution: Resolution = "raw",
    db: AsyncSession = Depends(get_db),
) -> list[ReadingPoint]:
    if resolution == "raw":
        raw_stmt = select(SensorReading).where(SensorReading.run_id == run_id)
        if sensor:
            raw_stmt = raw_stmt.where(SensorReading.sensor_name.in_(sensor))
        if start is not None:
            raw_stmt = raw_stmt.where(SensorReading.timestamp >= start)
        if end is not None:
            raw_stmt = raw_stmt.where(SensorReading.timestamp <= end)
        raw_stmt = raw_stmt.order_by(SensorReading.timestamp.asc()).limit(20000)
        raw_rows = (await db.execute(raw_stmt)).scalars().all()
        return [
            ReadingPoint(
                timestamp=r.timestamp, sensor_name=r.sensor_name, value=r.value, unit=r.unit
            )
            for r in raw_rows
        ]

    seconds = _BUCKET_SECONDS[resolution]
    bucket = func.to_timestamp(
        func.floor(func.extract("epoch", SensorReading.timestamp) / seconds) * seconds
    ).label("bucket")
    stmt = (
        select(
            bucket,
            SensorReading.sensor_name,
            func.avg(SensorReading.value).label("value"),
            func.max(SensorReading.unit).label("unit"),
        )
        .where(SensorReading.run_id == run_id)
        .group_by(bucket, SensorReading.sensor_name)
        .order_by(bucket.asc())
    )
    if sensor:
        stmt = stmt.where(SensorReading.sensor_name.in_(sensor))
    if start is not None:
        stmt = stmt.where(SensorReading.timestamp >= start)
    if end is not None:
        stmt = stmt.where(SensorReading.timestamp <= end)

    rows = (await db.execute(stmt)).all()
    return [
        ReadingPoint(
            timestamp=row.bucket,
            sensor_name=row.sensor_name,
            value=float(row.value),
            unit=row.unit,
        )
        for row in rows
    ]


@router.get("/{run_id}/readings/latest", response_model=list[LatestReading])
async def latest_readings(
    run_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> list[LatestReading]:
    subq = (
        select(
            SensorReading.sensor_name,
            func.max(SensorReading.timestamp).label("ts"),
        )
        .where(SensorReading.run_id == run_id)
        .group_by(SensorReading.sensor_name)
        .subquery()
    )
    stmt = select(SensorReading).join(
        subq,
        (SensorReading.sensor_name == subq.c.sensor_name)
        & (SensorReading.timestamp == subq.c.ts),
    ).where(SensorReading.run_id == run_id)
    rows = (await db.execute(stmt)).scalars().all()
    return [
        LatestReading(
            sensor_name=r.sensor_name, timestamp=r.timestamp, value=r.value, unit=r.unit
        )
        for r in rows
    ]
