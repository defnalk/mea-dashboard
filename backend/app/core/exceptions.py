"""Custom exception types raised by services and caught by API layer."""
from __future__ import annotations


class AppError(Exception):
    """Base class for all application errors."""

    status_code: int = 500

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class CSVParseError(AppError):
    status_code = 422


class RunNotFoundError(AppError):
    status_code = 404


class InvalidAnalysisRequestError(AppError):
    status_code = 400
