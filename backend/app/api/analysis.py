"""Analysis endpoints — call meapy via the bridge service."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.analysis import (
    HeatExchangerRequest,
    HeatExchangerResult,
    MassTransferRequest,
    MassTransferResult,
    PumpRequest,
    PumpResult,
)
from app.services import meapy_bridge

router = APIRouter()


@router.post("/{run_id}/analysis/heat-exchanger", response_model=HeatExchangerResult)
async def heat_exchanger(
    run_id: uuid.UUID,
    body: HeatExchangerRequest,
    db: AsyncSession = Depends(get_db),
) -> HeatExchangerResult:
    return await meapy_bridge.run_heat_exchanger(db, run_id, body)


@router.post("/{run_id}/analysis/pump", response_model=PumpResult)
async def pump(
    run_id: uuid.UUID,
    body: PumpRequest,
    db: AsyncSession = Depends(get_db),
) -> PumpResult:
    return await meapy_bridge.run_pump(db, run_id, body)


@router.post("/{run_id}/analysis/mass-transfer", response_model=MassTransferResult)
async def mass_transfer(
    run_id: uuid.UUID,
    body: MassTransferRequest,
    db: AsyncSession = Depends(get_db),
) -> MassTransferResult:
    return await meapy_bridge.run_mass_transfer(db, run_id, body)
