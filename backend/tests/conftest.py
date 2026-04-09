"""Pytest fixtures: in-memory SQLite engine, app override, async client."""
from __future__ import annotations

import sqlite3
import uuid
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio

# SQLite can't bind uuid.UUID natively — register an adapter for tests.
sqlite3.register_adapter(uuid.UUID, lambda u: str(u))
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import create_app


@pytest_asyncio.fixture
async def engine():  # type: ignore[no-untyped-def]
    eng = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    await eng.dispose()


@pytest_asyncio.fixture
async def session(engine) -> AsyncIterator[AsyncSession]:  # type: ignore[no-untyped-def]
    sm = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with sm() as s:
        yield s


@pytest_asyncio.fixture
async def client(engine) -> AsyncIterator[AsyncClient]:  # type: ignore[no-untyped-def]
    sm = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async def _override_get_db() -> AsyncIterator[AsyncSession]:
        async with sm() as s:
            yield s

    app = create_app()
    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def normal_csv_bytes() -> bytes:
    header = "timestamp,TT101,FT103,LT101,AT101\n"
    rows = [
        f"2025-01-15 08:00:{i:02d},{85 + i * 0.01},{900 + i},{50 + i * 0.05},{2.0 + i * 0.01}"
        for i in range(20)
    ]
    return (header + "\n".join(rows) + "\n").encode()
