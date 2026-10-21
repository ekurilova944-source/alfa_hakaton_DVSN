import { useMemo, useState } from "react";
import { ApiStatus, Button, EmptyState, Field, Segmented } from "../components/ui.jsx";
import { getCompany } from "../api.js";
import {
  BUSINESS_AGE_TYPES,
  BUSINESS_TYPES,
  COLLATERAL_TYPES,
  LOAN_PURPOSES,
  PRODUCTS,
  formatDate,
  formatMoney,
  formatRate,
  monthlyPayment,
} from "../data/mock.js";

const AMOUNT_MIN = 50000;
const AMOUNT_MAX = 30000000;
const AMOUNT_STEP = 50000;

function isEligible(product, amount, months) {
  return (
    amount >= product.minAmount &&
    amount <= product.maxAmount &&
    months >= product.minTermMonths &&
    months <= product.maxTermMonths
  );
}

export default function CreditCalculator({ defaultCompany, health, onApply }) {
  const [bizType, setBizType] = useState("ip");
  const [collateral, setCollateral] = useState("none");
  const [bizAge, setBizAge] = useState("more3");
  const [amount, setAmount] = useState(4150000);
  const [termYears, setTermYears] = useState(3);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailsProductId, setDetailsProductId] = useState(null);
  const [form, setForm] = useState({
    inn: defaultCompany?.inn || "",
    revenue: "",
    profit: "",
    obligations: "",
    purpose: LOAN_PURPOSES[2],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [lookup, setLookup] = useState({ state: "idle", company: null, error: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = termYears * 12;
  const userAgeMonths = bizAge === "more3" ? 36 : 1;

  const products = useMemo(
    () =>
      PRODUCTS.filter(
        (product) =>
          product.businessTypes.includes(bizType) &&
          product.collateral === collateral &&
          product.minBusinessAge <= userAgeMonths
      ),
    [bizType, collateral, userAgeMonths]
  );

  const selectedProduct = products.find((product) => product.id === selectedProductId) || null;

  function resetForm(product) {
    setSelectedProductId(product.id);
    setDetailsProductId(null);
    setFieldErrors({});
    setLookup({ state: "idle", company: null, error: null });
    setForm((previous) => ({
      ...previous,
      inn: previous.inn || defaultCompany?.inn || "",
    }));
  }

  function updateField(name, value) {
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleLookup() {
    setLookup({ state: "loading", company: null, error: null });
    const result = await getCompany(form.inn);
    if (result.ok) {
      setLookup({ state: "ok", company: result.company, error: null });
    } else {
      setLookup({ state: "error", company: null, error: result });
    }
  }

  function validate() {
    const errors = {};
    if (!/^\d{10}(\d{2})?$/.test(String(form.inn).trim())) {
      errors.inn = "ИНН должен состоять из 10 или 12 цифр";
    }
    const revenue = Number(form.revenue);
    if (!form.revenue || Number.isNaN(revenue) || revenue <= 0) {
      errors.revenue = "Укажите выручку за отчётный год";
    }
    if (form.profit === "" || Number.isNaN(Number(form.profit))) {
      errors.profit = "Укажите чистую прибыль (может быть отрицательной)";
    }
    if (form.obligations === "" || Number.isNaN(Number(form.obligations))) {
      errors.obligations = "Укажите текущие кредитные обязательства";
    }
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!selectedProduct) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    onApply({
      product: selectedProduct,
      amount,
      termMonths: months,
      purpose: form.purpose,
      inn: String(form.inn).trim(),
      company: lookup.company || defaultCompany,
      revenue: Number(form.revenue),
      profit: Number(form.profit),
      obligations: Number(form.obligations),
      revenueSource: lookup.state === "ok" ? "api" : "manual",
    });
    setIsSubmitting(false);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Подбор кредита</h1>
          <p className="page-subtitle">
            Укажите параметры — каталог обновится. Продукты и расчёты демонстрационные.
          </p>
        </div>
        <div className="page-head-actions">
          <ApiStatus health={health} />
        </div>
      </div>

      <div className="calc-layout">
        <aside className="calc-filters">
          <h2 className="calc-filters-title">Рассчитаем кредит под вашу задачу</h2>

          <div className="filter-group">
            <div className="filter-label">Тип регистрации</div>
            <Segmented options={BUSINESS_TYPES} value={bizType} onChange={setBizType} ariaLabel="Тип регистрации" />
          </div>

          <div className="filter-group">
            <div className="filter-label">Залог</div>
            <Segmented options={COLLATERAL_TYPES} value={collateral} onChange={setCollateral} ariaLabel="Залог" />
          </div>

          <div className="filter-group">
            <div className="filter-label">Срок ведения бизнеса</div>
            <Segmented options={BUSINESS_AGE_TYPES} value={bizAge} onChange={setBizAge} ariaLabel="Срок ведения бизнеса" />
          </div>

          <div className="slider-card">
            <div className="slider-label">Сумма кредита</div>
            <div className="slider-value">{formatMoney(amount)}</div>
            <input
              className="range"
              type="range"
              min={AMOUNT_MIN}
              max={AMOUNT_MAX}
              step={AMOUNT_STEP}
              value={amount}
              aria-label="Сумма кредита"
              onChange={(event) => setAmount(Number(event.target.value))}
            />
            <div className="range-scale">
              <span>50 тыс ₽</span>
              <span>15 млн ₽</span>
              <span>30 млн ₽</span>
            </div>
          </div>

          <div className="slider-card">
            <div className="slider-label">Срок кредита</div>
            <div className="slider-value">
              {termYears} {termYears === 1 ? "год" : termYears < 5 ? "года" : "лет"}
            </div>
            <input
              className="range"
              type="range"
              min={1}
              max={10}
              step={1}
              value={termYears}
              aria-label="Срок кредита"
              onChange={(event) => setTermYears(Number(event.target.value))}
            />
            <div className="range-scale">
              <span>1 год</span>
              <span>5 лет</span>
              <span>10 лет</span>
            </div>
          </div>

          <p className="hint-sm">Ставки и условия тестовые, не являются офертой банка.</p>
        </aside>

        <section className="calc-results">
          {products.length === 0 && (
            <EmptyState
              icon="🔍"
              title="Подходящих продуктов нет"
              text="Измените тип регистрации, залог или срок ведения бизнеса."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setBizType("ip");
                    setCollateral("none");
                    setBizAge("more3");
                  }}
                >
                  Сбросить фильтры
                </Button>
              }
            />
          )}

          {products.map((product) => {
            const eligible = isEligible(product, amount, months);
            const payment =
              eligible && product.calculable ? monthlyPayment(amount, product.rate, months) : null;
            const overpayment = payment ? payment * months - amount : null;
            const isSelected = selectedProductId === product.id;

            return (
              <article className="card product-card" key={product.id}>
                <div className="product-head">
                  <div>
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-subtitle">{product.subtitle}</p>
                  </div>
                  <div className="product-icon" aria-hidden="true">
                    {product.icon}
                  </div>
                </div>

                <div className="product-metrics">
                  <div>
                    <div className="metric-label">Ставка</div>
                    <div className="metric-value">{formatRate(product.rate)}</div>
                  </div>
                  <div>
                    <div className="metric-label">Переплата</div>
                    <div className="metric-value">{overpayment ? formatMoney(overpayment) : "—"}</div>
                  </div>
                  <div>
                    <div className="metric-label">Платёж</div>
                    <div className="metric-value">{payment ? formatMoney(payment) : "—"}</div>
                  </div>
                </div>

                {!eligible && (
                  <p className="hint-sm" style={{ marginBottom: 12 }}>
                    Недоступно для текущих суммы и срока: продукт от {formatMoney(product.minAmount)} до{" "}
                    {formatMoney(product.maxAmount)}, срок от {product.minTermMonths} до{" "}
                    {product.maxTermMonths} мес.
                  </p>
                )}

                <div className="product-actions">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setDetailsProductId((current) => (current === product.id ? null : product.id))
                    }
                  >
                    {detailsProductId === product.id ? "Свернуть" : "Узнать подробнее"}
                  </Button>
                  <Button variant="primary" onClick={() => resetForm(product)} disabled={!eligible}>
                    Заполнить заявку
                  </Button>
                </div>

                {detailsProductId === product.id && (
                  <div className="company-result" style={{ marginTop: 16 }}>
                    <div>
                      <div className="company-result-label">Базовая ставка</div>
                      <div className="company-result-value">{formatRate(product.rate)} годовых</div>
                    </div>
                    <div>
                      <div className="company-result-label">Сумма</div>
                      <div className="company-result-value">
                        {formatMoney(product.minAmount)} — {formatMoney(product.maxAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="company-result-label">Срок</div>
                      <div className="company-result-value">
                        {product.minTermMonths} — {product.maxTermMonths} мес.
                      </div>
                    </div>
                    <div>
                      <div className="company-result-label">Требования</div>
                      <div className="company-result-value">
                        {product.collateral === "with" ? "С залогом" : "Без залога"} · бизнес от{" "}
                        {product.minBusinessAge} мес.
                      </div>
                    </div>
                  </div>
                )}

                {isSelected && (
                  <form className="apply-panel" onSubmit={handleSubmit} noValidate>
                    <h4 className="apply-title">
                      Заявка на «{product.title}» · {formatMoney(amount)} · {months} мес.
                    </h4>

                    <div className="form-grid">
                      <Field label="ИНН компании" htmlFor="applyInn" error={fieldErrors.inn}>
                        <input
                          id="applyInn"
                          className={`input${fieldErrors.inn ? " has-error" : ""}`}
                          value={form.inn}
                          inputMode="numeric"
                          maxLength={12}
                          placeholder="10 или 12 цифр"
                          onChange={(event) => {
                            updateField("inn", event.target.value);
                            setLookup({ state: "idle", company: null, error: null });
                          }}
                        />
                      </Field>
                      <div className="field">
                        <span className="field-label">Сведения о компании</span>
                        <div className="row row-wrap">
                          <Button
                            variant="secondary"
                            onClick={handleLookup}
                            loading={lookup.state === "loading"}
                          >
                            Найти организацию
                          </Button>
                        </div>
                      </div>

                      <Field label="Выручка за отчётный год, ₽" htmlFor="applyRevenue" error={fieldErrors.revenue}>
                        <input
                          id="applyRevenue"
                          className={`input${fieldErrors.revenue ? " has-error" : ""}`}
                          inputMode="numeric"
                          placeholder="Например, 10 000 000"
                          value={form.revenue}
                          onChange={(event) => updateField("revenue", event.target.value)}
                        />
                      </Field>
                      <Field label="Чистая прибыль за отчётный год, ₽" htmlFor="applyProfit" error={fieldErrors.profit}>
                        <input
                          id="applyProfit"
                          className={`input${fieldErrors.profit ? " has-error" : ""}`}
                          inputMode="numeric"
                          placeholder="Например, 2 000 000"
                          value={form.profit}
                          onChange={(event) => updateField("profit", event.target.value)}
                        />
                      </Field>
                      <Field
                        label="Текущие кредитные обязательства, ₽"
                        htmlFor="applyObligations"
                        error={fieldErrors.obligations}
                      >
                        <input
                          id="applyObligations"
                          className={`input${fieldErrors.obligations ? " has-error" : ""}`}
                          inputMode="numeric"
                          placeholder="Например, 500 000"
                          value={form.obligations}
                          onChange={(event) => updateField("obligations", event.target.value)}
                        />
                      </Field>
                      <Field label="Цель кредитования" htmlFor="applyPurpose">
                        <select
                          id="applyPurpose"
                          className="input"
                          value={form.purpose}
                          onChange={(event) => updateField("purpose", event.target.value)}
                        >
                          {LOAN_PURPOSES.map((purpose) => (
                            <option key={purpose} value={purpose}>
                              {purpose}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {lookup.state === "error" && (
                      <div className="notice notice-warn" style={{ marginTop: 16 }}>
                        {lookup.error?.message || "Не удалось получить данные компании."}
                      </div>
                    )}

                    {lookup.company && (
                      <div className="company-result">
                        <div>
                          <div className="company-result-label">Компания</div>
                          <div className="company-result-value">{lookup.company.company_name || "—"}</div>
                        </div>
                        <div>
                          <div className="company-result-label">ИНН</div>
                          <div className="company-result-value">{lookup.company.inn}</div>
                        </div>
                        <div>
                          <div className="company-result-label">Статус</div>
                          <div className="company-result-value">{lookup.company.company_status || "—"}</div>
                        </div>
                        <div>
                          <div className="company-result-label">Дата регистрации</div>
                          <div className="company-result-value">{formatDate(lookup.company.registration_date)}</div>
                        </div>
                        <div>
                          <div className="company-result-label">УСН</div>
                          <div className="company-result-value">{lookup.company.is_simplified_tax ? "Да" : "Нет"}</div>
                        </div>
                      </div>
                    )}

                    <div className="form-actions">
                      <Button variant="ghost" onClick={() => setSelectedProductId(null)}>
                        Отмена
                      </Button>
                      <Button type="submit" variant="primary" loading={isSubmitting}>
                        Отправить заявку
                      </Button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
