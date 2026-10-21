"""FastAPI-приложение: health-check и поиск компании по ИНН."""

from __future__ import annotations

import logging
import re
from typing import Annotated

import psycopg
from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from psycopg.rows import dict_row

from . import db
from .config import get_settings
from .schemas import Company, ErrorResponse, HealthResponse, ServiceInfo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

# ООО — 10 цифр, ИП — 12 цифр.
INN_RE = re.compile(r"^(?:\d{10}|\d{12})$")

COMPANY_SELECT = """
    SELECT inn,
           company_name,
           registration_date,
           company_status,
           industry,
           region_code,
           is_simplified_tax,
           dissolution_flag
      FROM companies
     WHERE inn = %(inn)s
"""

app = FastAPI(
    title="Alfa Hakaton Backend",
    version="0.1.0",
    description=(
        "Минимальный backend для кредитования ИП/ООО: "
        "проверка состояния сервиса и карточка компании по ИНН."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=ServiceInfo, summary="Информация о сервисе", tags=["service"])
def root() -> ServiceInfo:
    """Короткая информация о сервисе и ссылка на Swagger UI."""
    return ServiceInfo(service="alfa-hakaton-backend", docs="/docs")


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Проверка состояния сервиса и БД",
    tags=["service"],
)
def health() -> HealthResponse:
    """Всегда отвечает 200; доступность БД отражается в поле ``database``."""
    return HealthResponse(
        status="ok",
        database="ok" if db.ping() else "unavailable",
    )


@app.get(
    "/api/companies/{inn}",
    response_model=Company,
    summary="Компания по ИНН",
    responses={
        404: {"model": ErrorResponse, "description": "Компания не найдена"},
        422: {"model": ErrorResponse, "description": "Некорректный ИНН"},
        503: {"model": ErrorResponse, "description": "База данных недоступна"},
    },
    tags=["companies"],
)
def get_company(
    inn: Annotated[
        str,
        Path(description="ИНН: 10 цифр (ООО) или 12 цифр (ИП)", examples=["7701234567"]),
    ],
) -> Company:
    """Ищет компанию по ИНН.

    ИНН валидируется вручную, чтобы вернуть понятный ``detail`` (а не
    стандартный список ошибок FastAPI). Запрос к БД параметризован.
    """
    if not INN_RE.fullmatch(inn):
        raise HTTPException(
            status_code=422,
            detail="ИНН должен состоять только из цифр и содержать 10 или 12 символов",
        )

    try:
        with db.connection() as conn, conn.cursor(row_factory=dict_row) as cur:
            cur.execute(COMPANY_SELECT, {"inn": inn})
            row = cur.fetchone()
    except (psycopg.Error, OSError) as exc:
        # Клиенту не отдаём stack trace, детали пишем в лог.
        logger.error("Ошибка БД при поиске компании по ИНН %s: %s", inn, exc, exc_info=True)
        raise HTTPException(status_code=503, detail="База данных недоступна") from exc

    if row is None:
        raise HTTPException(status_code=404, detail="Компания не найдена")

    return Company(**row)


if __name__ == "__main__":  # pragma: no cover - ручной запуск
    import uvicorn

    uvicorn.run("app.main:app", host=settings.app_host, port=settings.app_port)
