import React from "react";
import LoginForm from "../components/Auth/LoginForm";
import "../styles/LoginForm.css";
import logo from "../assets/logo.svg";

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-container">
      <div className="login-split-card">
        <div className="login-left">
          <img
            src={logo}
            alt="Logo del sistema"
            className="login-image"
            draggable={false}
          />
        </div>
        <div className="login-right">
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;