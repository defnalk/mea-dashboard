"""Smoke tests for the runs API end-to-end (upload → list → fetch → delete)."""
from __future__ import annotations

from httpx import AsyncClient


async def test_upload_list_get_delete_run(client: AsyncClient, normal_csv_bytes: bytes) -> None:
    files = {"file": ("normal.csv", normal_csv_bytes, "text/csv")}
    data = {"name": "first run", "description": "smoke"}
    resp = await client.post("/api/v1/runs/upload", files=files, data=data)
    assert resp.status_code == 201, resp.text
    run = resp.json()
    run_id = run["id"]
    assert run["reading_count"] > 0

    listing = await client.get("/api/v1/runs")
    assert listing.status_code == 200
    assert any(r["id"] == run_id for r in listing.json())

    fetched = await client.get(f"/api/v1/runs/{run_id}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "first run"

    deleted = await client.delete(f"/api/v1/runs/{run_id}")
    assert deleted.status_code == 204

    missing = await client.get(f"/api/v1/runs/{run_id}")
    assert missing.status_code == 404


async def test_upload_rejects_bad_csv(client: AsyncClient) -> None:
    files = {"file": ("bad.csv", b"not,a,csv\n", "text/csv")}
    data = {"name": "bad"}
    resp = await client.post("/api/v1/runs/upload", files=files, data=data)
    assert resp.status_code == 422
