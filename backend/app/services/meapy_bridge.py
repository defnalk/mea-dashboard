"""Bridge between stored sensor data and the ``meapy`` library.

Each public function pulls the relevant sensor series from the database,
averages them (or, for the mass-transfer profile, samples them by height),
and forwards them to the corresponding meapy routine.

The signatures used here track ``meapy>=0.1.0``.
"""
from __future__ import annotations

import logging
import uuid
from collections.abc import Iterable
from statistics import mean

from meapy import heat_transfer, mass_transfer, pump
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    C100_PLATE_AREA_M2,
    COLUMN_CROSS_SECTION_M2,
    CP_MEA_J_KG_K,
    CP_WATER_J_KG_K,
)
from app.core.exceptions import InvalidAnalysisRequestError, RunNotFoundError
from app.models import PlantRun, SensorReading
from app.schemas.analysis import (
    HeatExchangerRequest,
    HeatExchangerResult,
    MassTransferProfilePoint,
    MassTransferRequest,
    MassTransferResult,
    PumpRequest,
    PumpResult,
)

logger = logging.getLogger(__name__)


async def _ensure_run(db: AsyncSession, run_id: uuid.UUID) -> None:
    if (await db.get(PlantRun, run_id)) is None:
        raise RunNotFoundError(f"Run {run_id} not found")


async def _series(db: AsyncSession, run_id: uuid.UUID, sensor: str) -> list[float]:
    stmt = (
        select(SensorReading.value)
        .where(SensorReading.run_id == run_id, SensorReading.sensor_name == sensor)
        .order_by(SensorReading.timestamp.asc())
    )
    rows = (await db.execute(stmt)).scalars().all()
    if not rows:
        raise InvalidAnalysisRequestError(f"No readings found for sensor {sensor!r}")
    return [float(r) for r in rows]


def _avg(values: Iterable[float]) -> float:
    seq = list(values)
    if not seq:
        raise InvalidAnalysisRequestError("empty series")
    return mean(seq)


async def run_heat_exchanger(
    db: AsyncSession, run_id: uuid.UUID, body: HeatExchangerRequest
) -> HeatExchangerResult:
    await _ensure_run(db, run_id)

    result = heat_transfer.analyse_exchanger(
        mea_flow_kg_h=_avg(await _series(db, run_id, body.mea_flow_sensor)),
        cp_mea_j_kg_k=CP_MEA_J_KG_K,
        t_mea_in_c=_avg(await _series(db, run_id, body.t_mea_in_sensor)),
        t_mea_out_c=_avg(await _series(db, run_id, body.t_mea_out_sensor)),
        utility_flow_kg_h=_avg(await _series(db, run_id, body.utility_flow_sensor)),
        cp_utility_j_kg_k=CP_WATER_J_KG_K,
        t_utility_in_c=_avg(await _series(db, run_id, body.t_utility_in_sensor)),
        t_utility_out_c=_avg(await _series(db, run_id, body.t_utility_out_sensor)),
        area_m2=body.area_m2 if body.area_m2 is not None else C100_PLATE_AREA_M2,
        flow_direction=body.flow_direction,
    )
    return HeatExchangerResult(**result)


async def run_pump(db: AsyncSession, run_id: uuid.UUID, body: PumpRequest) -> PumpResult:
    await _ensure_run(db, run_id)

    speeds = await _series(db, run_id, body.pump_speed_sensor)
    levels = await _series(db, run_id, body.mea_level_sensor)
    flows = await _series(db, run_id, body.flowrate_sensor)
    if not (len(speeds) == len(levels) == len(flows)) or len(speeds) < 3:
        raise InvalidAnalysisRequestError(
            "pump speed, level, and flow series must align with at least 3 points",
        )

    flow_model = pump.fit_linear_flowrate_model(speeds, flows)
    level_model = pump.fit_exponential_level_model(speeds, levels)

    kwargs: dict[str, float] = {}
    if body.level_alarm_pct is not None:
        kwargs["level_alarm_pct"] = body.level_alarm_pct
    if body.flow_alarm_kg_h is not None:
        kwargs["flow_alarm_kg_h"] = body.flow_alarm_kg_h

    commission = pump.safe_pump_speed(
        level_model=level_model,
        flow_model=flow_model,
        **kwargs,
    )
    return PumpResult(
        safe_speed_pct=commission.safe_speed_pct,
        predicted_level_pct=commission.predicted_level_pct,
        predicted_flow_kg_h=commission.predicted_flow_kg_h,
        level_alarm_speed_pct=commission.level_alarm_speed_pct,
        flow_alarm_speed_pct=commission.flow_alarm_speed_pct,
        limiting_constraint=commission.limiting_constraint,
        notes=list(commission.notes),
        flow_model={
            "slope": flow_model.slope,
            "intercept": flow_model.intercept,
            "r_squared": flow_model.r_squared,
        },
        level_model={
            "l0": level_model.l0,
            "k": level_model.k,
            "r_squared": level_model.r_squared,
        },
    )


async def run_mass_transfer(
    db: AsyncSession, run_id: uuid.UUID, body: MassTransferRequest
) -> MassTransferResult:
    await _ensure_run(db, run_id)

    if not body.sensors_by_height_m:
        raise InvalidAnalysisRequestError("sensors_by_height_m must not be empty")

    pairs = sorted(body.sensors_by_height_m.items(), key=lambda kv: kv[1])
    sampling_heights_m = [h for _, h in pairs]
    y_values = [_avg(await _series(db, run_id, sensor)) / 100.0 for sensor, _ in pairs]
    if len(y_values) < 2:
        raise InvalidAnalysisRequestError("need at least two sensors at different heights")

    koga = mass_transfer.koga_profile(
        inert_gas_flow_mol_s=body.inert_gas_flow_mol_s,
        cross_section_m2=COLUMN_CROSS_SECTION_M2,
        sampling_heights_m=sampling_heights_m,
        y_values=y_values,
    )

    profile = [
        MassTransferProfilePoint(height_m=h, k_oga=float(k))
        for h, k in zip(sampling_heights_m, koga, strict=False)
    ]

    y_bottom, y_top = y_values[0], y_values[-1]
    ntu = mass_transfer.ntu_og(y_bottom=y_bottom, y_top=y_top)
    inert_gas_flux = body.inert_gas_flow_mol_s / COLUMN_CROSS_SECTION_M2
    mean_koga = float(sum(koga) / len(koga)) if len(koga) else 0.0
    h_og_value = mass_transfer.hog(
        koga_mol_m3_s=mean_koga,
        inert_gas_flux_mol_m2_s=inert_gas_flux,
    )
    return MassTransferResult(profile=profile, ntu_og=ntu, h_og=h_og_value)
