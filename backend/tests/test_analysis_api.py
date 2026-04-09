"""Tests for analysis endpoints (calling real meapy)."""
from __future__ import annotations

from httpx import AsyncClient


def _csv() -> bytes:
    header = "timestamp,FT103,TT101,TT102,FT104,TT103,TT104\n"
    rows = [
        f"2025-01-15 08:00:{i:02d},{900 + i * 0.1},{85 - i * 0.05},{42 + i * 0.05},"
        f"{1500 + i * 0.2},{25 + i * 0.02},{45 + i * 0.02}"
        for i in range(20)
    ]
    return (header + "\n".join(rows) + "\n").encode()


async def test_heat_exchanger_real_meapy(client: AsyncClient) -> None:
    upload = await client.post(
        "/api/v1/runs/upload",
        files={"file": ("hx.csv", _csv(), "text/csv")},
        data={"name": "hx"},
    )
    assert upload.status_code == 201
    run_id = upload.json()["id"]

    body = {
        "mea_flow_sensor": "FT103",
        "t_mea_in_sensor": "TT101",
        "t_mea_out_sensor": "TT102",
        "utility_flow_sensor": "FT104",
        "t_utility_in_sensor": "TT103",
        "t_utility_out_sensor": "TT104",
    }
    r = await client.post(f"/api/v1/runs/{run_id}/analysis/heat-exchanger", json=body)
    assert r.status_code == 200, r.text
    payload = r.json()
    for key in ("q_hot_w", "q_cold_w", "lmtd_k", "u_w_m2_k", "efficiency", "ntu"):
        assert key in payload
    assert payload["lmtd_k"] > 0
