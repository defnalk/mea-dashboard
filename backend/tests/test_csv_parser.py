"""Tests for the CSV parser service."""
from __future__ import annotations

import pytest

from app.core.exceptions import CSVParseError
from app.services.csv_parser import parse_csv_upload


def test_parses_valid_csv(normal_csv_bytes: bytes) -> None:
    parsed = parse_csv_upload(normal_csv_bytes)
    assert parsed.report.rows_parsed == 20
    assert set(parsed.report.sensors_found) == {"TT101", "FT103", "LT101", "AT101"}
    assert parsed.start_time is not None and parsed.end_time is not None
    assert len(parsed.readings) == 20 * 4


def test_rejects_missing_timestamp() -> None:
    bad = b"time,TT101\n2025-01-15 08:00:00,85\n"
    with pytest.raises(CSVParseError, match="timestamp"):
        parse_csv_upload(bad)


def test_skips_non_numeric_values() -> None:
    csv_bytes = b"timestamp,TT101\n2025-01-15 08:00:00,not_a_num\n2025-01-15 08:00:30,86\n"
    parsed = parse_csv_upload(csv_bytes)
    assert parsed.report.rows_parsed == 1


def test_rejects_empty_csv() -> None:
    with pytest.raises(CSVParseError):
        parse_csv_upload(b"timestamp,TT101\n")
