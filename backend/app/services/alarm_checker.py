"""Alarm checker — evaluates readings against thresholds and rate-of-change."""
from __future__ import annotations

import uuid
from collections import defaultdict
from typing import Any

from app.core.constants import ALARM_THRESHOLDS, SENSOR_RANGE
from app.services.csv_parser import ReadingRow

RATE_OF_CHANGE_WINDOW_SECONDS = 60.0
RATE_OF_CHANGE_FRACTION = 0.20


def check_alarms(readings: list[ReadingRow], run_id: uuid.UUID) -> list[dict[str, Any]]:
    """Return a list of alarm-event dicts ready for bulk insert."""
    alarms: list[dict[str, Any]] = []

    # Threshold checks (per reading).
    for r in readings:
        threshold = ALARM_THRESHOLDS.get(r.sensor_name)
        if threshold is None:
            continue
        if threshold.high is not None and r.value > threshold.high:
            alarms.append(
                _build(
                    run_id, r, "HIGH", threshold.high,
                    f"{r.sensor_name} = {r.value:.2f}{r.unit} exceeds HIGH limit "
                    f"{threshold.high}{r.unit}",
                )
            )
        if threshold.low is not None and r.value < threshold.low:
            alarms.append(
                _build(
                    run_id, r, "LOW", threshold.low,
                    f"{r.sensor_name} = {r.value:.2f}{r.unit} below LOW limit "
                    f"{threshold.low}{r.unit}",
                )
            )

    # Rate-of-change checks per sensor.
    by_sensor: dict[str, list[ReadingRow]] = defaultdict(list)
    for r in readings:
        by_sensor[r.sensor_name].append(r)

    for sensor, series in by_sensor.items():
        sensor_range = SENSOR_RANGE.get(sensor)
        if sensor_range is None:
            continue
        threshold_delta = sensor_range * RATE_OF_CHANGE_FRACTION
        series_sorted = sorted(series, key=lambda r: r.timestamp)
        for i in range(1, len(series_sorted)):
            prev = series_sorted[i - 1]
            curr = series_sorted[i]
            dt = (curr.timestamp - prev.timestamp).total_seconds()
            if dt <= 0 or dt > RATE_OF_CHANGE_WINDOW_SECONDS:
                continue
            if abs(curr.value - prev.value) > threshold_delta:
                alarms.append(
                    _build(
                        run_id, curr, "RATE_OF_CHANGE", threshold_delta,
                        f"{sensor} changed by {curr.value - prev.value:.2f}{curr.unit} "
                        f"in {dt:.0f}s (>{int(RATE_OF_CHANGE_FRACTION * 100)}% range)",
                    )
                )

    return alarms


def _build(
    run_id: uuid.UUID,
    reading: ReadingRow,
    alarm_type: str,
    threshold: float,
    message: str,
) -> dict[str, Any]:
    return {
        "id": uuid.uuid4(),
        "run_id": run_id,
        "reading_id": None,
        "sensor_name": reading.sensor_name,
        "alarm_type": alarm_type,
        "threshold_value": threshold,
        "actual_value": reading.value,
        "triggered_at": reading.timestamp,
        "message": message,
    }
