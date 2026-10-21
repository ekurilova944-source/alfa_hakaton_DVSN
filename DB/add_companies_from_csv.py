import pandas as pd
from sqlalchemy import create_engine, inspect, text

# Подключение к PostgreSQL
engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@localhost:5432/alfa-hakaton"
)

# Читаем первые 1000 строк CSV
df = pd.read_csv("df_company2.csv", nrows=1000)

try:
    # Получаем информацию о столбцах таблицы
    inspector = inspect(engine)
    columns = inspector.get_columns("companies")

    # Преобразуем 0/1 в False/True для BOOLEAN-столбцов
    boolean_columns = [
        col["name"]
        for col in columns
        if str(col["type"]).upper() == "BOOLEAN"
    ]

    for column in boolean_columns:
        if column in df.columns:
            df[column] = df[column].map({
                0: False,
                1: True,
                0.0: False,
                1.0: True
            })

    # Исправляем .0 в строковых значениях
    for column in ["company_name", "region_code"]:
        if column in df.columns:
            df[column] = df[column].astype(str).str.replace(
                r"\.0$", "", regex=True
            )

    # Удаляем старые записи и загружаем новые в одной транзакции
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM companies"))

        df.to_sql(
            name="companies",
            con=connection,
            if_exists="append",
            index=False,
            chunksize=100,
            method=None
        )

    print(f"Таблица очищена. Загружено записей: {len(df)}")

except Exception as e:
    print("Ошибка при обработке данных:", e)

finally:
    engine.dispose()
