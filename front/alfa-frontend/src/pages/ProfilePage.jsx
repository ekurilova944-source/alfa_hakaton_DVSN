import { useState } from "react";
import { ApiStatus, Button, Field } from "../components/ui.jsx";
import { formatDate } from "../data/mock.js";
import { createFinancialStatement, getCompany } from "../api.js";

const EMPTY_FORM = {
  lastName: "",
  firstName: "",
  middleName: "",
  birthDate: "",
  inn: "",
  ogrnip: "",
  businessName: "",
  activity: "",
  taxSystem: "",
  phone: "",
  email: "",
  address: "",
};

function loadProfile() {
  try {
    const raw = localStorage.getItem("ipProfile");
    if (!raw) return EMPTY_FORM;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_FORM, ...parsed };
  } catch {
    return EMPTY_FORM;
  }
}

const FINANCIAL_FIELDS = [
  { key: "revenue", label: "Выручка, ₽" },
  { key: "net_profit", label: "Чистая прибыль, ₽" },
  { key: "assets", label: "Активы, ₽" },
  { key: "current_assets", label: "Оборотные активы, ₽" },
  { key: "total_equity", label: "Собственный капитал, ₽" },
  { key: "longterm_debt", label: "Долгосрочный долг, ₽" },
  { key: "shortterm_debt", label: "Краткосрочный долг, ₽" },
  { key: "shortterm_liab", label: "Краткосрочные обязательства, ₽" },
  { key: "retained_earnings", label: "Нераспределённая прибыль, ₽" },
  { key: "profit_from_sales", label: "Прибыль от продаж, ₽" },
  { key: "before_tax", label: "Прибыль до налогообложения, ₽" },
  { key: "cash_equivalents", label: "Денежные средства и эквиваленты, ₽" },
  { key: "interest_payable", label: "Проценты к уплате, ₽" },
  { key: "balance_operating", label: "Операционный баланс, ₽" },
];

export default function ProfilePage({ company, health }) {
  const [formData, setFormData] = useState(loadProfile);
  const [saved, setSaved] = useState(false);

  const [lookupInn, setLookupInn] = useState(company?.inn || "");
  const [lookup, setLookup] = useState({ state: "idle", company: null, error: null });

  const [financial, setFinancial] = useState(() => ({
    report_year: String(new Date().getFullYear()),
    ...Object.fromEntries(FINANCIAL_FIELDS.map((field) => [field.key, ""])),
  }));
  const [financialErrors, setFinancialErrors] = useState({});
  const [financialStatus, setFinancialStatus] = useState({ state: "idle", message: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setSaved(false);
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    localStorage.setItem("ipProfile", JSON.stringify(formData));
    setSaved(true);
  }

  async function handleLookup(event) {
    event?.preventDefault();
    setLookup({ state: "loading", company: null, error: null });
    const result = await getCompany(lookupInn);
    if (result.ok) {
      setLookup({ state: "ok", company: result.company, error: null });
    } else {
      setLookup({ state: "error", company: null, error: result });
    }
  }

  function handleFinancialChange(event) {
    const { name, value } = event.target;
    setFinancialErrors((previous) => ({ ...previous, [name]: undefined }));
    setFinancialStatus({ state: "idle", message: "" });
    setFinancial((previous) => ({ ...previous, [name]: value }));
  }

  async function handleFinancialSubmit(event) {
    event.preventDefault();

    const inn = company?.inn;
    if (!inn) {
      setFinancialStatus({
        state: "error",
        message: "Компания не загружена. Обновите страницу или войдите заново.",
      });
      return;
    }

    const errors = {};
    const reportYear = Number(financial.report_year);
    if (!financial.report_year || !Number.isInteger(reportYear) || reportYear < 1900) {
      errors.report_year = "Укажите отчётный год (не ранее 1900)";
    }

    const numericValues = {};
    for (const field of FINANCIAL_FIELDS) {
      const raw = String(financial[field.key] ?? "").trim();
      if (raw === "") {
        numericValues[field.key] = null;
        continue;
      }
      const value = Number(raw.replace(",", "."));
      if (Number.isNaN(value)) {
        errors[field.key] = "Введите число";
        continue;
      }
      numericValues[field.key] = value;
    }

    setFinancialErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFinancialStatus({ state: "idle", message: "" });
      return;
    }

    setFinancialStatus({ state: "saving", message: "" });
    const result = await createFinancialStatement({
      inn,
      report_year: reportYear,
      ...numericValues,
    });

    if (result.ok) {
      setFinancialStatus({
        state: "ok",
        message: `Отчётность за ${result.statement.report_year} год сохранена (ID ${result.statement.financial_id})`,
      });
    } else {
      setFinancialStatus({ state: "error", message: result.message });
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Профиль компании</h1>
          <p className="page-subtitle">
            Данные предпринимателя и сведения о бизнесе, привязанные к аккаунту.
          </p>
        </div>
        <div className="page-head-actions">
          <ApiStatus health={health} />
        </div>
      </div>

      <form className="card card-pad-lg" onSubmit={handleSave} style={{ marginBottom: 20 }}>
        <div className="profile-section">
          <h2 className="profile-section-title">Личные данные</h2>
          <div className="profile-grid">
            <Field label="Фамилия" htmlFor="lastName">
              <input id="lastName" className="input" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Введите фамилию" />
            </Field>
            <Field label="Имя" htmlFor="firstName">
              <input id="firstName" className="input" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Введите имя" />
            </Field>
            <Field label="Отчество" htmlFor="middleName">
              <input id="middleName" className="input" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Введите отчество" />
            </Field>
            <Field label="Дата рождения" htmlFor="birthDate">
              <input id="birthDate" className="input" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
            </Field>
            <Field label="ИНН" htmlFor="profileInn" hint="10 цифр для ООО, 12 — для ИП">
              <input id="profileInn" className="input" name="inn" value={formData.inn} onChange={handleChange} placeholder="Введите ИНН" inputMode="numeric" maxLength={12} />
            </Field>
            <Field label="ОГРНИП / ОГРН" htmlFor="ogrnip">
              <input id="ogrnip" className="input" name="ogrnip" value={formData.ogrnip} onChange={handleChange} placeholder="Введите ОГРНИП" inputMode="numeric" maxLength={15} />
            </Field>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">Информация о бизнесе</h2>
          <div className="profile-grid">
            <Field label="Название бизнеса" htmlFor="businessName">
              <input id="businessName" className="input" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Название вашего бизнеса" />
            </Field>
            <Field label="Сфера деятельности" htmlFor="activity">
              <select id="activity" className="input" name="activity" value={formData.activity} onChange={handleChange}>
                <option value="">Выберите сферу</option>
                <option value="Торговля">Торговля</option>
                <option value="Услуги">Услуги</option>
                <option value="Производство">Производство</option>
                <option value="ИТ">ИТ</option>
                <option value="Строительство">Строительство</option>
                <option value="Другое">Другое</option>
              </select>
            </Field>
            <Field label="Система налогообложения" htmlFor="taxSystem">
              <select id="taxSystem" className="input" name="taxSystem" value={formData.taxSystem} onChange={handleChange}>
                <option value="">Выберите систему</option>
                <option value="УСН «Доходы»">УСН «Доходы»</option>
                <option value="УСН «Доходы минус расходы»">УСН «Доходы минус расходы»</option>
                <option value="ПСН (патент)">ПСН (патент)</option>
                <option value="ОСНО">ОСНО</option>
                <option value="ЕСХН">ЕСХН</option>
                <option value="Пока не выбрана">Пока не выбрана</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">Контактные данные</h2>
          <div className="profile-grid">
            <Field label="Номер телефона" htmlFor="phone">
              <input id="phone" className="input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+7 (___) ___-__-__" />
            </Field>
            <Field label="Электронная почта" htmlFor="email">
              <input id="email" className="input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@mail.ru" />
            </Field>
            <Field label="Адрес регистрации" htmlFor="address" className="field-full">
              <input id="address" className="input" name="address" value={formData.address} onChange={handleChange} placeholder="Город, улица, дом" />
            </Field>
          </div>
        </div>

        <div className="form-actions">
          {saved && <span className="profile-saved">✓ Данные сохранены в этом браузере</span>}
          <Button type="submit" variant="primary">
            Сохранить данные
          </Button>
        </div>
      </form>

      <section className="card card-pad-lg">
        <h2 className="section-title">Проверка компании по ИНН</h2>
        <p className="page-subtitle" style={{ marginBottom: 18 }}>
          Сведения запрашиваются из backend (FastAPI + PostgreSQL, таблица companies).
        </p>

        <form onSubmit={handleLookup}>
          <div className="profile-grid">
            <Field label="ИНН компании" htmlFor="lookupInn">
              <input
                id="lookupInn"
                className="input"
                value={lookupInn}
                onChange={(event) => {
                  setLookupInn(event.target.value);
                  setLookup({ state: "idle", company: null, error: null });
                }}
                placeholder="10 или 12 цифр"
                inputMode="numeric"
                maxLength={12}
              />
            </Field>
          </div>
          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <Button type="submit" variant="primary" loading={lookup.state === "loading"}>
              Найти организацию
            </Button>
          </div>
        </form>

        {lookup.state === "error" && (
          <div className="notice notice-warn" style={{ marginTop: 16 }}>
            {lookup.error?.message || "Не удалось получить данные компании."}
          </div>
        )}

        {lookup.company && (
          <div className="company-result" style={{ marginTop: 18 }}>
            <div className="field-full">
              <div className="company-result-label">Название</div>
              <div className="company-result-value">{lookup.company.company_name || "—"}</div>
            </div>
            <div>
              <div className="company-result-label">ИНН</div>
              <div className="company-result-value">{lookup.company.inn}</div>
            </div>
            <div>
              <div className="company-result-label">Дата регистрации</div>
              <div className="company-result-value">{formatDate(lookup.company.registration_date)}</div>
            </div>
            <div>
              <div className="company-result-label">Статус</div>
              <div className="company-result-value">{lookup.company.company_status || "—"}</div>
            </div>
            <div>
              <div className="company-result-label">Отрасль (код)</div>
              <div className="company-result-value">{lookup.company.industry || "—"}</div>
            </div>
            <div>
              <div className="company-result-label">Регион</div>
              <div className="company-result-value">{lookup.company.region_code || "—"}</div>
            </div>
            <div>
              <div className="company-result-label">УСН</div>
              <div className="company-result-value">{lookup.company.is_simplified_tax ? "Да" : "Нет"}</div>
            </div>
            <div>
              <div className="company-result-label">Признак ликвидации</div>
              <div className="company-result-value">{lookup.company.dissolution_flag ? "Есть" : "Нет"}</div>
            </div>
          </div>
        )}
      </section>

      <section className="card card-pad-lg" style={{ marginTop: 20 }}>
        <h2 className="section-title">Финансовая отчётность</h2>
        <p className="page-subtitle" style={{ marginBottom: 18 }}>
          Годовой отчёт сохраняется в PostgreSQL (таблица financial_statements) через API.
        </p>

        <form onSubmit={handleFinancialSubmit} noValidate>
          <div className="profile-grid">
            <Field
              label="ИНН компании"
              hint="Определяется компанией, к которой привязан аккаунт"
            >
              <div className="readonly-value" id="financialInn">
                {company?.inn || "Компания не загружена"}
              </div>
            </Field>
            <Field label="Отчётный год" htmlFor="financialYear" error={financialErrors.report_year}>
              <input
                id="financialYear"
                className={`input${financialErrors.report_year ? " has-error" : ""}`}
                name="report_year"
                value={financial.report_year}
                onChange={handleFinancialChange}
                placeholder="Например, 2025"
                inputMode="numeric"
              />
            </Field>
          </div>

          <h3 className="profile-section-title" style={{ marginTop: 24 }}>
            Показатели отчётности
          </h3>
          <div className="profile-grid">
            {FINANCIAL_FIELDS.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                htmlFor={`financial-${field.key}`}
                error={financialErrors[field.key]}
              >
                <input
                  id={`financial-${field.key}`}
                  className={`input${financialErrors[field.key] ? " has-error" : ""}`}
                  name={field.key}
                  value={financial[field.key]}
                  onChange={handleFinancialChange}
                  placeholder="0"
                  inputMode="decimal"
                />
              </Field>
            ))}
          </div>

          <p className="hint-sm" style={{ marginTop: 14 }}>
            Все числовые показатели необязательны: незаполненные поля сохраняются как NULL.
            Отчётность сохраняется только по ИНН компании, к которой привязан аккаунт;
            запись за тот же год повторно не создаётся — API вернёт ошибку.
          </p>

          {financialStatus.state === "error" && (
            <div className="notice notice-warn" style={{ marginTop: 14 }}>
              {financialStatus.message}
            </div>
          )}

          <div className="form-actions">
            {financialStatus.state === "ok" && (
              <span className="profile-saved">✓ {financialStatus.message}</span>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={financialStatus.state === "saving"}
              disabled={!company?.inn}
            >
              Сохранить отчётность
            </Button>
          </div>
        </form>
      </section>

      <p className="hint-sm" style={{ textAlign: "center", marginTop: 20 }}>
        Данные профиля сохраняются локально в вашем браузере. Это демонстрационный интерфейс.
      </p>
    </div>
  );
}
