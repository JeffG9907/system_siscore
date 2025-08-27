import React from "react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="main-footer">
      <span>© {new Date().getFullYear()} SISCORE EC | Todos los derechos reservados.</span>
    </footer>
  );
}

export default Footer;