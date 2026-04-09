"""Tests for the alarm checker."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta

from app.services.alarm_checker import check_alarms
from app.services.csv_parser import ReadingRow


def _r(sensor: str, value: float, t: datetime, unit: str = "") -> ReadingRow:
    return ReadingRow(timestamp=t, sensor_name=sensor, value=value, unit=unit)


def test_high_threshold_triggers_alarm() -> None:
    t = datetime(2025, 1, 15, 8, 0, 0)
    alarms = check_alarms([_r("TT101", 130.0, t, "°C")], uuid.uuid4())
    assert any(a["alarm_type"] == "HIGH" for a in alarms)


def test_low_threshold_triggers_alarm() -> None:
    t = datetime(2025, 1, 15, 8, 0, 0)
    alarms = check_alarms([_r("LT101", 8.0, t, "%")], uuid.uuid4())
    assert any(a["alarm_type"] == "LOW" for a in alarms)


def test_normal_values_no_alarm() -> None:
    t = datetime(2025, 1, 15, 8, 0, 0)
    readings = [
        _r("TT101", 85.0, t),
        _r("LT101", 50.0, t),
        _r("FT103", 900.0, t),
    ]
    assert check_alarms(readings, uuid.uuid4()) == []


def test_rate_of_change_triggers() -> None:
    t = datetime(2025, 1, 15, 8, 0, 0)
    readings = [
        _r("FT103", 900.0, t),
        _r("FT103", 600.0, t + timedelta(seconds=30)),  # delta 300 > 20% of 1200
    ]
    alarms = check_alarms(readings, uuid.uuid4())
    assert any(a["alarm_type"] == "RATE_OF_CHANGE" for a in alarms)
