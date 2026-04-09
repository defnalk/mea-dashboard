"""CSV upload parser.

Accepts a CSV with a ``timestamp`` column and any number of sensor columns.
Returns a structured ``ParsedRun`` plus a parsing report.
"""
from __future__ import annotations

import csv
import io
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.core.constants import MAX_UPLOAD_BYTES, SENSOR_UNITS
from app.core.exceptions import CSVParseError

logger = logging.getLogger(__name__)

_TIMESTAMP_FORMATS = (
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d %H:%M:%S.%f",
    "%d/%m/%Y %H:%M:%S",
)


@dataclass
class ReadingRow:
    timestamp: datetime
    sensor_name: str
    value: float
    unit: str


@dataclass
class ParseReport:
    rows_parsed: int = 0
    rows_skipped: int = 0
    sensors_found: list[str] = field(default_factory=list)


@dataclass
class ParsedRun:
    readings: list[ReadingRow]
    report: ParseReport
    start_time: datetime | None
    end_time: datetime | None


def _parse_timestamp(raw: str) -> datetime:
    raw = raw.strip()
    # Fast path: ISO 8601
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        pass
    for fmt in _TIMESTAMP_FORMATS:
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    raise CSVParseError(f"Unrecognised timestamp format: {raw!r}")


def parse_csv_upload(content: bytes, *, filename: str = "upload.csv") -> ParsedRun:
    """Parse a CSV upload into ``ParsedRun``.

    Raises ``CSVParseError`` on structural problems (no timestamp, no rows, oversize).
    """
    if len(content) > MAX_UPLOAD_BYTES:
        raise CSVParseError(
            f"File {filename} exceeds maximum size of {MAX_UPLOAD_BYTES // (1024 * 1024)} MB"
        )

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise CSVParseError(f"File {filename} is not valid UTF-8: {exc}") from exc

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise CSVParseError("CSV is empty")

    headers = [h.strip() for h in reader.fieldnames]
    if "timestamp" not in headers:
        raise CSVParseError("CSV must contain a 'timestamp' column")

    sensor_columns = [h for h in headers if h != "timestamp" and h]
    if not sensor_columns:
        raise CSVParseError("CSV must contain at least one sensor column")

    readings: list[ReadingRow] = []
    report = ParseReport(sensors_found=sensor_columns)
    start_time: datetime | None = None
    end_time: datetime | None = None

    for row_num, raw_row in enumerate(reader, start=2):
        ts_raw = (raw_row.get("timestamp") or "").strip()
        if not ts_raw:
            report.rows_skipped += 1
            continue
        try:
            ts = _parse_timestamp(ts_raw)
        except CSVParseError as exc:
            logger.warning("row %s: %s", row_num, exc)
            report.rows_skipped += 1
            continue

        row_had_value = False
        for sensor in sensor_columns:
            raw_val = (raw_row.get(sensor) or "").strip()
            if raw_val == "" or raw_val.lower() in {"nan", "null"}:
                continue
            try:
                value = float(raw_val)
            except ValueError:
                logger.warning("row %s sensor %s: non-numeric value %r", row_num, sensor, raw_val)
                continue
            readings.append(
                ReadingRow(
                    timestamp=ts,
                    sensor_name=sensor,
                    value=value,
                    unit=SENSOR_UNITS.get(sensor, ""),
                )
            )
            row_had_value = True

        if row_had_value:
            report.rows_parsed += 1
            start_time = ts if start_time is None or ts < start_time else start_time
            end_time = ts if end_time is None or ts > end_time else end_time
        else:
            report.rows_skipped += 1

    if report.rows_parsed == 0:
        raise CSVParseError("CSV contained no parseable rows")

    return ParsedRun(readings=readings, report=report, start_time=start_time, end_time=end_time)


def reading_rows_as_dicts(rows: list[ReadingRow], run_id: Any) -> list[dict[str, Any]]:
    """Helper to map ReadingRow → dict suitable for bulk insert."""
    return [
        {
            "run_id": run_id,
            "timestamp": r.timestamp,
            "sensor_name": r.sensor_name,
            "value": r.value,
            "unit": r.unit,
        }
        for r in rows
    ]
