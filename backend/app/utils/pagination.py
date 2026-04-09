"""Simple offset/limit pagination helper."""
from __future__ import annotations

from dataclasses import dataclass

from fastapi import Query


@dataclass
class Pagination:
    offset: int
    limit: int


def pagination_params(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
) -> Pagination:
    return Pagination(offset=offset, limit=limit)
