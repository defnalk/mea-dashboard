"""Plant run endpoints — list, retrieve, delete, upload."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RunNotFoundError
from app.database import get_db
from app.models import PlantRun
from app.schemas.run import RunRead
from app.services.csv_parser import ParsedRun, parse_csv_upload
from app.services.runs_service import ingest_parsed_run
from app.utils.pagination import Pagination, pagination_params

router = APIRouter()


@router.get("", response_model=list[RunRead])
async def list_runs(
    pagination: Pagination = Depends(pagination_params),
    db: AsyncSession = Depends(get_db),
) -> list[PlantRun]:
    stmt = (
        select(PlantRun)
        .order_by(PlantRun.uploaded_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{run_id}", response_model=RunRead)
async def get_run(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> PlantRun:
    run = await db.get(PlantRun, run_id)
    if run is None:
        raise RunNotFoundError(f"Run {run_id} not found")
    return run


@router.delete("/{run_id}", status_code=204)
async def delete_run(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    run = await db.get(PlantRun, run_id)
    if run is None:
        raise RunNotFoundError(f"Run {run_id} not found")
    await db.delete(run)
    await db.commit()


@router.post("/upload", response_model=RunRead, status_code=201)
async def upload_run(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
) -> PlantRun:
    raw = await file.read()
    parsed: ParsedRun = parse_csv_upload(raw, filename=file.filename or "upload.csv")
    return await ingest_parsed_run(db, name=name, description=description, parsed=parsed)
