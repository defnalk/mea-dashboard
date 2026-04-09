"""Run ingestion service — persists a ParsedRun and its derived alarms."""
from __future__ import annotations

import logging

from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AlarmEvent, PlantRun, SensorReading
from app.services.alarm_checker import check_alarms
from app.services.csv_parser import ParsedRun, reading_rows_as_dicts

logger = logging.getLogger(__name__)


async def ingest_parsed_run(
    db: AsyncSession,
    *,
    name: str,
    description: str | None,
    parsed: ParsedRun,
) -> PlantRun:
    run = PlantRun(
        name=name,
        description=description,
        start_time=parsed.start_time,
        end_time=parsed.end_time,
        reading_count=len(parsed.readings),
    )
    db.add(run)
    await db.flush()  # populate run.id

    if parsed.readings:
        await db.execute(
            insert(SensorReading), reading_rows_as_dicts(parsed.readings, run.id)
        )

    alarm_dicts = check_alarms(parsed.readings, run.id)
    if alarm_dicts:
        await db.execute(insert(AlarmEvent), alarm_dicts)
    run.alarm_count = len(alarm_dicts)

    await db.commit()
    await db.refresh(run)
    logger.info(
        "ingested run %s: %d readings, %d alarms",
        run.id, run.reading_count, run.alarm_count,
    )
    return run
