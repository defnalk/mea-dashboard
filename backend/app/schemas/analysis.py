"""Pydantic schemas for analysis endpoints.

These schemas mirror the inputs that ``meapy`` expects. The frontend supplies
sensor names; the bridge service averages each series and feeds the result to
meapy along with constants from ``meapy.constants``.
"""
from __future__ import annotations

from pydantic import BaseModel


class HeatExchangerRequest(BaseModel):
    mea_flow_sensor: str
    t_mea_in_sensor: str
    t_mea_out_sensor: str
    utility_flow_sensor: str
    t_utility_in_sensor: str
    t_utility_out_sensor: str
    area_m2: float | None = None  # defaults to PlantGeometry.C100_PLATE_AREA_M2
    flow_direction: str = "counter"


class HeatExchangerResult(BaseModel):
    q_hot_w: float
    q_cold_w: float
    q_loss_w: float
    lmtd_k: float
    u_w_m2_k: float
    u_kw_m2_k: float
    efficiency: float
    effectiveness: float
    ntu: float


class PumpRequest(BaseModel):
    pump_speed_sensor: str
    mea_level_sensor: str
    flowrate_sensor: str
    level_alarm_pct: float | None = None
    flow_alarm_kg_h: float | None = None


class PumpResult(BaseModel):
    safe_speed_pct: float
    predicted_level_pct: float
    predicted_flow_kg_h: float
    level_alarm_speed_pct: float
    flow_alarm_speed_pct: float
    limiting_constraint: str
    notes: list[str]
    flow_model: dict[str, float]
    level_model: dict[str, float]


class MassTransferRequest(BaseModel):
    """Sensors → height map. Each sensor measures CO₂ vol% at a known column height."""

    sensors_by_height_m: dict[str, float]
    inert_gas_flow_mol_s: float


class MassTransferProfilePoint(BaseModel):
    height_m: float
    k_oga: float


class MassTransferResult(BaseModel):
    profile: list[MassTransferProfilePoint]
    ntu_og: float
    h_og: float
