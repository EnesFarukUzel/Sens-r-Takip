import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import AlarmHistory from './pages/AlarmHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import TodayRegistrations from './admin/TodayRegistrations';
import SensorManagement from './admin/SensorManagement';
import SystemSettings from './admin/SystemSettings';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isAdmin } from './services/auth';
import './styles/App.css';

// Özel Route bileşeni - korumalı rotalar için
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  return isLoggedIn ? element : <Navigate to="/login" replace />;
};

// Admin Route bileşeni - sadece admin kullanıcılar için
const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

// Ana içerik bileşeni
const AppContent: React.FC = () => {
  const { isLoggedIn, logout, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
      <Router>
      <div className={`min-vh-100 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
        {isLoggedIn && <Header onLogout={logout} />}
        <main className={`${isLoggedIn ? 'pt-5 mt-4' : ''}`}>
          <div className="container-fluid px-4">
            <Routes>
              {/* Admin rotaları */}
              <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
              <Route path="/admin/users" element={<AdminRoute element={<UserManagement />} />} />
              <Route path="/admin/sensors" element={<AdminRoute element={<SensorManagement />} />} />
              <Route path="/admin/today-registrations" element={<AdminRoute element={<TodayRegistrations />} />} />
              <Route path="/admin/pending-approvals" element={<AdminRoute element={<UserManagement />} />} />
              <Route path="/admin/today-pending" element={<AdminRoute element={<TodayRegistrations />} />} />
              <Route path="/admin/system-settings" element={<AdminRoute element={<SystemSettings />} />} />
              <Route path="/admin/reports" element={<AdminRoute element={<Reports />} />} />
              
              {/* Korumalı rotalar */}
              <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/data" element={<PrivateRoute element={<DataVisualization />} />} />
              <Route path="/analytics" element={<PrivateRoute element={<Analytics />} />} />
              <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
              <Route path="/alarms" element={<PrivateRoute element={<AlarmHistory />} />} />
              <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

              {/* Genel rotalar */}
              <Route path="/login" element={
                isLoggedIn ? <Navigate to="/" replace /> : <Login />
              } />
              <Route path="/register" element={
                isLoggedIn ? <Navigate to="/" replace /> : <Register />
              } />

              {/* Bilinmeyen rotaları ana sayfaya yönlendir */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        </div>
      </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
    </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 