import React, { useEffect } from "react";
import {
  FaBars,
  FaChevronLeft,
  FaSignOutAlt,
  FaHome,
  FaBolt,
  FaPlug,
  FaChartBar,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";
import logo from "../assets/logo.svg";
import "../styles/Sidebar.css";

function getInitial(name) {
  if (!name || typeof name !== "string") return "?";
  return name.trim()[0].toUpperCase();
}

const ALL_OPTIONS = [
  { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
  { key: "cortes", label: "Cortes", icon: <FaBolt /> },
  { key: "reconexiones", label: "Reconexiones", icon: <FaPlug /> },
  { key: "reportes", label: "Reportes", icon: <FaChartBar /> },
  { key: "novedades", label: "Novedades", icon: <FaExclamationTriangle /> },
  { key: "usuarios", label: "Usuarios", icon: <FaUsers /> },
];

function getMenuOptionsByRole(role) {
  switch (role) {
    case "admin":
      return ALL_OPTIONS;
    case "secretaria":
      return ALL_OPTIONS.filter((opt) => opt.key !== "usuarios");
    case "operador":
      return ALL_OPTIONS.filter((opt) =>
        ["dashboard", "cortes", "reconexiones", "novedades"].includes(opt.key)
      );
    default:
      return [];
  }
}

const Sidebar = ({
  user,
  activeSection,
  onNavigate,
  onLogout,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  // Detecta si es móvil usando media query
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 850);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
      // En mobile, si cambia tamaño a desktop, cerramos sidebar móvil
      if (window.innerWidth > 850 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen, setMobileOpen]);

  // Evita scroll del body cuando sidebar móvil está abierto
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, mobileOpen]);

  const role = user?.role || "";
  const menuOptions = getMenuOptionsByRole(role);

  // Maneja click fuera del sidebar en móviles para cerrar
  const handleOverlayClick = () => {
    if (isMobile && mobileOpen) setMobileOpen(false);
  };

  // Botón hamburguesa para abrir sidebar en móvil
  // Este botón lo puedes poner en tu header/topbar (ejemplo abajo)
  // <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(true)}>
  //   <FaBars />
  // </button>

  return (
    <>
      {/* Overlay en móvil */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <aside
        className={`sidebar${collapsed ? " collapsed" : ""}${isMobile && mobileOpen ? " open" : ""}`}
        aria-label="Menú lateral"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
          </div>
          {!collapsed && (
            <div className="sidebar-title-group">
              <span className="sidebar-title">S.I.S</span>
              <span className="sidebar-subtitle">Sistema Integral Siscore</span>
            </div>
          )}
          {collapsed ? (
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed(false)}
              title="Expandir menú"
              aria-label="Expandir menú"
            >
              <FaBars />
            </button>
          ) : (
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed(true)}
              title="Colapsar menú"
              aria-label="Colapsar menú"
            >
              <FaChevronLeft />
            </button>
          )}
        </div>
        {!collapsed && (
          <div className="sidebar-userbox">
            <span className="sidebar-userinitial">
              {getInitial(user?.name)}
            </span>
            <span className="sidebar-username">{user?.name || "Usuario"}</span>
            <button
              className="sidebar-logout-inline"
              onClick={onLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <FaSignOutAlt />
            </button>
          </div>
        )}
        <nav className="sidebar-nav">
          <ul>
            {menuOptions.map((opt) => (
              <li
                key={opt.key}
                onClick={() => {
                  onNavigate(opt.key);
                  // Cierra sidebar en móvil al navegar
                  if (isMobile && mobileOpen) setMobileOpen(false);
                }}
                className={activeSection === opt.key ? "active" : ""}
                title={opt.label}
                tabIndex={0}
                role="button"
                aria-label={opt.label}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    onNavigate(opt.key);
                    if (isMobile && mobileOpen) setMobileOpen(false);
                  }
                }}
              >
                {opt.icon}
                {!collapsed && <span>{opt.label}</span>}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;