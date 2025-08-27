import React, { useState, useRef, useEffect } from "react";

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current && userRef.current.focus();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await fetch("https://backend-apiemail.up.railway.app/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      // Guarda usuario completo + token
      onLogin({ ...data.user, token: data.token });
    } else {
      setError(data.message || "Credenciales incorrectas");
    }
  } catch (err) {
    setError("Error de conexión");
  }
  setLoading(false);
};

  return (
    <form
      className="login-form"
      onSubmit={handleSubmit}
      autoComplete="off"
      aria-label="Formulario de inicio de sesión"
    >
      <h1 className="login-title">S.I.S</h1>
      <h2 className="login-subtitle">SISTEMA INTEGRAL SISCORE</h2>

      <input
        name="username"
        type="text"
        value={form.username}
        onChange={handleChange}
        required
        placeholder="Usuario"
        ref={userRef}
        aria-label="Usuario"
        autoFocus
        autoComplete="username"
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
        placeholder="Contraseña"
        aria-label="Contraseña"
        autoComplete="current-password"
      />
      {error && (
        <div className="error" role="alert" aria-live="assertive">
          ⚠️ {error}
        </div>
      )}
      <button type="submit" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
};

export default LoginForm;