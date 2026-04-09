"""Tests for readings query endpoints."""
from __future__ import annotations

from httpx import AsyncClient


async def test_readings_and_latest(client: AsyncClient, normal_csv_bytes: bytes) -> None:
    resp = await client.post(
        "/api/v1/runs/upload",
        files={"file": ("n.csv", normal_csv_bytes, "text/csv")},
        data={"name": "r"},
    )
    run_id = resp.json()["id"]

    raw = await client.get(f"/api/v1/runs/{run_id}/readings", params={"sensor": "TT101"})
    assert raw.status_code == 200
    points = raw.json()
    assert len(points) > 0
    assert all(p["sensor_name"] == "TT101" for p in points)

    latest = await client.get(f"/api/v1/runs/{run_id}/readings/latest")
    assert latest.status_code == 200
    sensors = {p["sensor_name"] for p in latest.json()}
    assert "TT101" in sensors
