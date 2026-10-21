import { useState } from "react";
import { ApiStatus, Button, Field } from "../components/ui.jsx";
import { DEMO_COMPANIES, formatDate } from "../data/mock.js";
import { getCompany } from "../api.js";

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

export default function ProfilePage({ company, health }) {
  const [formData, setFormData] = useState(loadProfile);
  const [saved, setSaved] = useState(false);

  const [lookupInn, setLookupInn] = useState(company?.inn || "");
  const [lookup, setLookup] = useState({ state: "idle", company: null, error: null });

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

  function useDemoCompany() {
    const demo = DEMO_COMPANIES[String(lookupInn).trim()];
    if (demo) {
      setLookup({ state: "demo", company: demo, error: null });
    } else {
      setLookup({
        state: "error",
        company: null,
        error: {
          type: "not_found",
          message:
            "В демо-справочнике нет компании с таким ИНН. Попробуйте 7707083893, 7701234567 или 770123456789.",
        },
      });
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
            {lookup.state === "error" && lookup.error?.type === "unavailable" && (
              <Button variant="secondary" onClick={useDemoCompany}>
                Показать демо-данные
              </Button>
            )}
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
            {lookup.state === "demo" && (
              <div className="field-full">
                <span className="badge badge-neutral">Демо-данные: backend недоступен</span>
              </div>
            )}
          </div>
        )}
      </section>

      <p className="hint-sm" style={{ textAlign: "center", marginTop: 20 }}>
        Данные профиля сохраняются локально в вашем браузере. Это демонстрационный интерфейс.
      </p>
    </div>
  );
}
