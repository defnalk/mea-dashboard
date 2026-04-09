# Backend — MEA Dashboard API

FastAPI service for ingesting plant CSVs, storing readings, evaluating alarms, and running meapy analyses.

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Tests

```bash
pytest
```

Tests use an in-memory SQLite engine via `tests/conftest.py`, so Postgres is not required.

## Key endpoints

| Method | Path                                       | Purpose                       |
|--------|--------------------------------------------|-------------------------------|
| POST   | `/api/v1/runs/upload`                      | Upload a CSV → create a run   |
| GET    | `/api/v1/runs`                             | List runs                     |
| GET    | `/api/v1/runs/{id}/readings`               | Query readings (downsamplable)|
| GET    | `/api/v1/runs/{id}/readings/latest`        | Latest value per sensor       |
| GET    | `/api/v1/runs/{id}/alarms`                 | Alarm events                  |
| POST   | `/api/v1/runs/{id}/analysis/heat-exchanger`| meapy heat exchanger analysis |
| POST   | `/api/v1/runs/{id}/analysis/pump`          | meapy pump commissioning      |
| POST   | `/api/v1/runs/{id}/analysis/mass-transfer` | meapy K_OGa profile           |
| GET    | `/api/v1/health`                           | DB + meapy version check      |
