"""Plant constants — pulled from meapy.constants where possible.

The :mod:`meapy.constants` module exposes class-level dataclass attributes for
plant geometry, MEA properties, and alarm limits. We import them here so that
the API and meapy stay in lock-step. Hard-coded fallbacks are kept only for
sensors that meapy doesn't define limits for.
"""
from __future__ import annotations

from dataclasses import dataclass

from meapy.constants import AlarmLimits, MEAProperties, PlantGeometry


@dataclass(frozen=True)
class Threshold:
    low: float | None
    high: float | None


ALARM_THRESHOLDS: dict[str, Threshold] = {
    "LT101": Threshold(low=AlarmLimits.LT101_LOW_LEVEL_PCT, high=85.0),
    "TT101": Threshold(low=None, high=120.0),
    "TT102": Threshold(low=None, high=120.0),
    "TT103": Threshold(low=None, high=120.0),
    "TT104": Threshold(low=None, high=120.0),
    "TT105": Threshold(low=None, high=120.0),
    "TT106": Threshold(low=None, high=120.0),
    "FT103": Threshold(low=50.0, high=AlarmLimits.FT103_HIGH_FLOW_KG_H),
    "FT104": Threshold(low=50.0, high=AlarmLimits.FT104_HIGH_FLOW_KG_H),
    "AT101": Threshold(low=None, high=15.0),
}

SENSOR_UNITS: dict[str, str] = {
    "TT101": "°C",
    "TT102": "°C",
    "TT103": "°C",
    "TT104": "°C",
    "TT105": "°C",
    "TT106": "°C",
    "FT103": "kg/h",
    "FT104": "kg/h",
    "LT101": "%",
    "AT101": "vol%",
    "PS_J100": "%",
}

SENSOR_DISPLAY_NAMES: dict[str, str] = {
    "TT101": "Absorber Inlet Temperature",
    "TT102": "Absorber Outlet Temperature",
    "TT103": "Utility Inlet Temperature",
    "FT103": "MEA Flowrate",
    "LT101": "MEA Tank Level",
    "AT101": "CO₂ Outlet Concentration",
    "PS_J100": "Pump J-100 Speed",
}

# For rate-of-change alarms: representative full-scale range per sensor.
SENSOR_RANGE: dict[str, float] = {
    "TT101": 150.0,
    "TT102": 150.0,
    "TT103": 150.0,
    "TT104": 150.0,
    "TT105": 150.0,
    "TT106": 150.0,
    "FT103": 1200.0,
    "FT104": 1200.0,
    "LT101": 100.0,
    "AT101": 20.0,
}

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

# Re-exported plant constants used by the meapy bridge.
COLUMN_HEIGHT_M: float = PlantGeometry.COLUMN_HEIGHT_M
COLUMN_CROSS_SECTION_M2: float = PlantGeometry.COLUMN_CROSS_SECTION_M2
SAMPLING_HEIGHTS_M: list[float] = list(PlantGeometry.SAMPLING_HEIGHTS_M)
C100_PLATE_AREA_M2: float = PlantGeometry.C100_PLATE_AREA_M2
CP_MEA_J_KG_K: float = MEAProperties.CP_15_PCT_AT_40C
CP_WATER_J_KG_K: float = 4180.0
