import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importar páginas principales
import DashboardPage from './pages/DashboardPage';
import CortePage from './pages/CortePage';
import CorteViewPage from './pages/View/CorteViewPage';
import ReconexionPage from './pages/ReconexionPage';
import ReconexionViewPage from './pages/View/ReconexionViewPage';
import ReportePage from './pages/ReportesPage';
import IncidenciaPage from './pages/IncidenciasPage';
import IncidenciaViewPage from './pages/View/IncidenciaViewPage';
import UsuarioPage from './pages/UsuarioPage';
import LoginPage from './pages/LoginPage';

// Componentes generales
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Tema MUI
const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' },
    secondary: { main: '#2196F3' },
  },
});

// ProtectedRoute: Solo muestra children si hay usuario logueado
function ProtectedRoute({ user, pageKey, children, onLogout, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        user={user}
        activeSection={pageKey}
        onNavigate={route => navigate(`/${route}`)}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`main-content${collapsed ? " collapsed" : ""}`} style={{ flex: 1, marginLeft: collapsed ? 64 : 220, transition: "margin-left 0.22s" }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.clear();
      return null;
    }
  });

  const [collapsed, setCollapsed] = useState(false);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', userObj.token);
    window.location.replace("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.replace("/login");
  };

  const showLogin = !user;
  const isEmapaped = user?.role === "emapaped";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <Routes>
              {showLogin ? (
                <>
                  <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
                  <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={
                    <ProtectedRoute user={user} pageKey="dashboard" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/cortes" element={
                    <ProtectedRoute user={user} pageKey="cortes" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}>
                      {isEmapaped ? <CorteViewPage /> : <CortePage />}
                    </ProtectedRoute>
                  } />
                  <Route path="/reconexiones" element={
                    <ProtectedRoute user={user} pageKey="reconexiones" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}>
                      {isEmapaped ? <ReconexionViewPage /> : <ReconexionPage />}
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes" element={
                    <ProtectedRoute user={user} pageKey="reportes" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}>
                      <ReportePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/novedades" element={
                    <ProtectedRoute user={user} pageKey="novedades" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}>
                      {isEmapaped ? <IncidenciaViewPage /> : <IncidenciaPage />}
                    </ProtectedRoute>
                  } />
                  <Route path="/usuarios" element={
                    <ProtectedRoute user={user} pageKey="usuarios" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}>
                      <UsuarioPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
                </>
              )}
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;