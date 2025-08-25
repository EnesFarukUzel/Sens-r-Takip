import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../services/auth';

const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState<Array<{ id: number; text: string; isNew: boolean }>>([]);

  // Bildirimleri yükle
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Backend API çağrısı burada yapılacak
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        // setNotifications(data.notifications);
        
        console.log('Bildirimler yükleniyor...');
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${isDarkMode ? 'navbar-dark' : 'navbar-light'} shadow-lg`} 
         style={{
           background: isDarkMode 
             ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
             : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
           backdropFilter: 'blur(10px)',
           borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
         }}>
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <div className="me-3" style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            <i className="bi bi-thermometer-half"></i>
          </div>
          <span className="fw-bold" style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Sensör İzleme
          </span>
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
          style={{
            border: 'none',
            boxShadow: 'none'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link px-3 py-2 rounded-3 ${location.pathname === '/' ? 'active' : ''}`}
                style={{
                  transition: 'all 0.3s ease',
                  color: location.pathname === '/' ? (isDarkMode ? '#22c55e' : '#0ea5e9') : 'inherit'
                }}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/analytics" 
                className={`nav-link px-3 py-2 rounded-3 ${location.pathname === '/analytics' ? 'active' : ''}`}
                style={{
                  transition: 'all 0.3s ease',
                  color: location.pathname === '/analytics' ? (isDarkMode ? '#22c55e' : '#0ea5e9') : 'inherit'
                }}
              >
                <i className="bi bi-graph-up me-2"></i>
                Analiz
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/reports" 
                className={`nav-link px-3 py-2 rounded-3 ${location.pathname === '/reports' ? 'active' : ''}`}
                style={{
                  transition: 'all 0.3s ease',
                  color: location.pathname === '/reports' ? (isDarkMode ? '#22c55e' : '#0ea5e9') : 'inherit'
                }}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Raporlar
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/alarms" 
                className={`nav-link px-3 py-2 rounded-3 ${location.pathname === '/alarms' ? 'active' : ''}`}
                style={{
                  transition: 'all 0.3s ease',
                  color: location.pathname === '/alarms' ? (isDarkMode ? '#22c55e' : '#0ea5e9') : 'inherit'
                }}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Alarmlar
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/settings" 
                className={`nav-link px-3 py-2 rounded-3 ${location.pathname === '/settings' ? 'active' : ''}`}
                style={{
                  transition: 'all 0.3s ease',
                  color: location.pathname === '/settings' ? (isDarkMode ? '#22c55e' : '#0ea5e9') : 'inherit'
                }}
              >
                <i className="bi bi-gear me-2"></i>
                Ayarlar
              </Link>
            </li>
            {/* Admin paneli linki - sadece admin kullanıcılar için */}
            {isAdmin() && (
              <li className="nav-item">
                <Link 
                  to="/admin" 
                  className={`nav-link px-3 py-2 rounded-3 ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  style={{
                    transition: 'all 0.3s ease',
                    color: location.pathname.startsWith('/admin') ? (isDarkMode ? '#22c55e' : '#0ea5e9') : 'inherit'
                  }}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-center">
            {/* Bildirimler */}
            <li className="nav-item dropdown me-3">
              <button
                className="btn btn-link nav-link border-0 position-relative p-2 rounded-3"
                data-bs-toggle="dropdown"
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.borderColor = isDarkMode ? '#22c55e' : '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <i className="bi bi-bell fs-5"></i>
                {notifications.filter(n => n.isNew).length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        style={{ fontSize: '0.6rem' }}>
                    {notifications.filter(n => n.isNew).length}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end" style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <li><h6 className="dropdown-header">Bildirimler</h6></li>
                {notifications.map(notification => (
                  <li key={notification.id}>
                    <button className={`dropdown-item py-2 px-3 ${notification.isNew ? 'bg-light' : ''}`} style={{
                      color: isDarkMode ? '#cbd5e1' : '#475569',
                      background: 'transparent',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <small>{notification.text}</small>
                      {notification.isNew && <span className="badge bg-primary ms-2">Yeni</span>}
                    </button>
                  </li>
                ))}
                <li><hr className="dropdown-divider" style={{
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                }} /></li>
                <li><button className="dropdown-item text-center py-2 px-3" style={{
                  color: isDarkMode ? '#cbd5e1' : '#475569',
                  background: 'transparent',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}>Tümünü Gör</button></li>
              </ul>
            </li>

            {/* Tema Değiştirici */}
            <li className="nav-item me-3">
              <button
                className="btn btn-link nav-link border-0 p-2 rounded-3"
                onClick={toggleTheme}
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.borderColor = isDarkMode ? '#22c55e' : '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <i className={`bi ${isDarkMode ? 'bi-sun' : 'bi-moon'} fs-5`}></i>
              </button>
            </li>

            {/* Kullanıcı Menüsü */}
            <li className="nav-item dropdown">
              <button
                className="btn btn-link nav-link dropdown-toggle border-0 d-flex align-items-center p-2 rounded-3"
                data-bs-toggle="dropdown"
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.borderColor = isDarkMode ? '#22c55e' : '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div className="me-2" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.9rem'
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="d-none d-md-inline">{user?.name || 'Kullanıcı'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <li>
                  <div className="dropdown-header">
                    <strong style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                      {user?.name || user?.username || 'Kullanıcı'}
                    </strong>
                    <br />
                    <small className="text-muted" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      {user?.email}
                    </small>
                    {isAdmin() && (
                      <span className="badge bg-danger ms-1">Admin</span>
                    )}
                  </div>
                </li>
                <li>
                  <hr className="dropdown-divider" style={{
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                  }} />
                </li>
                <li>
                  <Link className="dropdown-item py-2 px-3" to="/profile" style={{
                    color: isDarkMode ? '#cbd5e1' : '#475569',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-person me-2"></i>
                    Profil
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-2 px-3" to="/settings" style={{
                    color: isDarkMode ? '#cbd5e1' : '#475569',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-gear me-2"></i>
                    Ayarlar
                  </Link>
                </li>
                {isAdmin() && (
                  <li>
                    <Link className="dropdown-item py-2 px-3" to="/admin" style={{
                      color: isDarkMode ? '#cbd5e1' : '#475569',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="bi bi-shield-check me-2"></i>
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <hr className="dropdown-divider" style={{
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                  }} />
                </li>
                <li>
                  <button 
                    className="dropdown-item py-2 px-3" 
                    onClick={onLogout}
                    style={{
                      color: isDarkMode ? '#cbd5e1' : '#475569',
                      background: 'transparent',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 