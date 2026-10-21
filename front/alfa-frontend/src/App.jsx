
import { useState } from "react";
import "./App.css";

function App() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    inn: "",
    ogrnip: "",
    birthDate: "",
    businessName: "",
    activity: "",
    taxSystem: "",
    phone: "",
    email: "",
    address: "",
  });

  function handleLogin(event) {
    event.preventDefault();

    if (!login.trim() || !password.trim()) {
      setError("Заполни логин и пароль");
      return;
    }

    setError("");
    setIsLoggedIn(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSave(event) {
    event.preventDefault();

    localStorage.setItem("ipProfile", JSON.stringify(formData));

    alert("Данные сохранены в этом браузере!");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setLogin("");
    setPassword("");
    setError("");
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginTop: "8px",
    border: "1px solid #d9dce3",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "#fff",
    color: "#222",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "20px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "0 24px",
  };

  // Личный кабинет предпринимателя
  if (isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f6fa",
          fontFamily: "Arial, sans-serif",
          color: "#222",
        }}
      >
        <header
          style={{
            background: "#fff",
            padding: "18px 5%",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                background: "#ef3124",
                color: "#fff",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "25px",
                fontWeight: "bold",
              }}
            >
              А
            </div>

            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                Альфа-Бизнес
              </div>
              <div style={{ fontSize: "12px", color: "#777" }}>
                Бизнес-платформа
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Выйти
          </button>
        </header>

        <main
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "36px 20px 60px",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                color: "#ef3124",
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              ЛИЧНЫЙ КАБИНЕТ
            </div>

            <h1 style={{ fontSize: "30px", margin: "0 0 12px" }}>
              Данные предпринимателя
            </h1>

            <p style={{ color: "#666", lineHeight: 1.6, margin: 0 }}>
              Заполните информацию о себе и своём бизнесе.
              Вы сможете сохранить данные и вернуться к ним позже.
            </p>
          </div>

          <form
            onSubmit={handleSave}
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h2 style={{ fontSize: "20px", margin: "0 0 24px" }}>
              Личные данные
            </h2>

            <div style={gridStyle}>
              <label style={labelStyle}>
                Фамилия
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Введите фамилию"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Имя
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Введите имя"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Отчество
                <input
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Введите отчество"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Дата рождения
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                ИНН
                <input
                  name="inn"
                  value={formData.inn}
                  onChange={handleChange}
                  placeholder="Введите ИНН"
                  inputMode="numeric"
                  maxLength={12}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                ОГРНИП
                <input
                  name="ogrnip"
                  value={formData.ogrnip}
                  onChange={handleChange}
                  placeholder="Введите ОГРНИП"
                  inputMode="numeric"
                  maxLength={15}
                  style={inputStyle}
                />
              </label>
            </div>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid #eee",
                margin: "8px 0 28px",
              }}
            />

            <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>
              Информация о бизнесе
            </h2>

            <div style={gridStyle}>
              <label style={labelStyle}>
                Название бизнеса
                <input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Название вашего бизнеса"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Сфера деятельности
                <select
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Выберите сферу</option>
                  <option value="Торговля">Торговля</option>
                  <option value="Услуги">Услуги</option>
                  <option value="Производство">Производство</option>
                  <option value="ИТ">ИТ</option>
                  <option value="Строительство">Строительство</option>
                  <option value="Другое">Другое</option>
                </select>
              </label>

              <label style={labelStyle}>
                Система налогообложения
                <select
                  name="taxSystem"
                  value={formData.taxSystem}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Выберите систему</option>
                  <option value="УСН «Доходы»">УСН «Доходы»</option>
                  <option value="УСН «Доходы минус расходы»">
                    УСН «Доходы минус расходы»
                  </option>
                  <option value="ПСН (патент)">ПСН (патент)</option>
                  <option value="ОСНО">ОСНО</option>
                  <option value="ЕСХН">ЕСХН</option>
                  <option value="Пока не выбрана">Пока не выбрана</option>
                </select>
              </label>
            </div>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid #eee",
                margin: "8px 0 28px",
              }}
            />

            <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>
              Контактные данные
            </h2>

            <div style={gridStyle}>
              <label style={labelStyle}>
                Номер телефона
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (___) ___-__-__"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Электронная почта
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.ru"
                  style={inputStyle}
                />
              </label>

              <label
                style={{
                  ...labelStyle,
                  gridColumn: "1 / -1",
                }}
              >
                Адрес регистрации
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Город, улица, дом"
                  style={inputStyle}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <button
                type="submit"
                style={{
                  background: "#ef3124",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px 28px",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Сохранить данные
              </button>
            </div>
          </form>

          <p
            style={{
              color: "#888",
              fontSize: "12px",
              textAlign: "center",
              marginTop: "24px",
            }}
          >
            Данные сохраняются локально в вашем браузере.
            Это демонстрационный интерфейс.
          </p>
        </main>
      </div>
    );
  }

  // Экран входа
  return (
    <div className="login-page">
      <header className="brand">
        <div className="brand-logo">А</div>

        <div>
          <div className="brand-name">Альфа</div>
          <div className="brand-subtitle">Бизнес-платформа</div>
        </div>
      </header>

      <main className="login-container">
        <div className="login-label">ЛИЧНЫЙ КАБИНЕТ</div>

        <h1>Добро пожаловать!</h1>

        <p className="login-description">
          Управляйте финансами и кредитными заявками вашего бизнеса
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="login">Логин или email</label>

          <input
            id="login"
            type="text"
            placeholder="name@company.ru"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
          />

          <label htmlFor="password">Пароль</label>

          <input
            id="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <div className="error-message">{error}</div>}

          <button className="login-button" type="submit">
            Войти <span>→</span>
          </button>
        </form>

        <div className="login-footer">
          Безопасные финансовые решения для вашего бизнеса
        </div>
      </main>

      <footer className="page-footer">
        © 2026 Альфа · Бизнес-платформа
      </footer>
    </div>
  );
}

export default App;
