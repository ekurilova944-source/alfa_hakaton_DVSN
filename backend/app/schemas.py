"""Pydantic-модели ответов API."""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class ServiceInfo(BaseModel):
    """Короткая информация о сервисе (GET /)."""

    service: str = Field(examples=["alfa-hakaton-backend"])
    docs: str = Field(examples=["/docs"])


class HealthResponse(BaseModel):
    """Статус сервиса и БД (GET /health). HTTP-код всегда 200."""

    status: Literal["ok"] = "ok"
    database: Literal["ok", "unavailable"]


class Company(BaseModel):
    """Компания из таблицы ``companies`` (все поля, кроме inn, могут быть NULL)."""

    inn: str
    company_name: str | None = None
    registration_date: date | None = None
    company_status: str | None = None
    industry: str | None = None
    region_code: str | None = None
    is_simplified_tax: bool | None = None
    dissolution_flag: bool | None = None


class ErrorResponse(BaseModel):
    """Единый формат ошибки."""

    detail: str
