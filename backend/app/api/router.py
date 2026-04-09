"""Top-level API router wiring all sub-routers."""
from __future__ import annotations

from fastapi import APIRouter

from app.api import alarms, analysis, readings, runs
from app.database import engine

api_router = APIRouter()
api_router.include_router(runs.router, prefix="/runs", tags=["runs"])
api_router.include_router(readings.router, prefix="/runs", tags=["readings"])
api_router.include_router(alarms.router, prefix="/runs", tags=["alarms"])
api_router.include_router(analysis.router, prefix="/runs", tags=["analysis"])


@api_router.get("/health")
async def health() -> dict[str, object]:
    import meapy

    meapy_version: str = getattr(meapy, "__version__", "unknown")

    db_ok = True
    try:
        async with engine.connect() as conn:
            await conn.exec_driver_sql("SELECT 1")
    except Exception:
        db_ok = False

    return {"status": "ok" if db_ok else "degraded", "db": db_ok, "meapy": meapy_version}
