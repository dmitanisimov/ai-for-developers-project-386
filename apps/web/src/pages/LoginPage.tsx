import { useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../api/client";
import { Link } from "../components/Link";
import { navigate } from "../lib/router";

export const LoginPage = () => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError("");
      await api.login({ email, password, rememberMe });
      navigate("/admin");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <main className="page-shell compact">
      <form className="simple-card form-stack" onSubmit={submit}>
        <p className="eyebrow">Админка</p>
        <h1>Вход</h1>
        {error ? <p className="error-box">{error}</p> : null}
        <label className="field-label">
          Email
          <input className="input" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="field-label">
          Пароль
          <input className="input" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label className="checkbox-label">
          <input checked={rememberMe} type="checkbox" onChange={(event) => setRememberMe(event.target.checked)} />
          <span>Запомнить меня</span>
        </label>
        <button className="primary-button" type="submit">
          Войти
        </button>
        <Link className="subtle-link" to="/">
          На главную
        </Link>
      </form>
    </main>
  );
};
