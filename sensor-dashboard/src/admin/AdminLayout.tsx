import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-dashboard">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 px-0">
            <div className="admin-sidebar">
              <div className="text-center mb-4">
                <h4 className="text-white mb-0">
                  <i className="fas fa-shield-alt me-2"></i>
                  Admin Panel
                </h4>
                <small className="text-white-50">Sensör Yönetim Sistemi</small>
              </div>
              
              <nav className="nav flex-column">
                <Link className={`nav-link ${isActive('/admin') ? 'active' : ''}`} to="/admin">
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </Link>
                <Link className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`} to="/admin/users">
                  <i className="fas fa-users"></i>
                  Kullanıcı Yönetimi
                </Link>
                <Link className={`nav-link ${isActive('/admin/sensors') ? 'active' : ''}`} to="/admin/sensors">
                  <i className="fas fa-microchip"></i>
                  Sensör Yönetimi
                </Link>
                <Link className={`nav-link ${isActive('/admin/today-registrations') ? 'active' : ''}`} to="/admin/today-registrations">
                  <i className="fas fa-user-plus"></i>
                  Bugün Kayıt Olanlar
                </Link>
                <Link className={`nav-link ${isActive('/admin/pending-approvals') ? 'active' : ''}`} to="/admin/pending-approvals">
                  <i className="fas fa-clock"></i>
                  Onay Bekleyenler
                </Link>
                <Link className={`nav-link ${isActive('/admin/today-pending') ? 'active' : ''}`} to="/admin/today-pending">
                  <i className="fas fa-hourglass-half"></i>
                  Bugün Onay Bekleyen
                </Link>
                <Link className={`nav-link ${isActive('/admin/system-settings') ? 'active' : ''}`} to="/admin/system-settings">
                  <i className="fas fa-cog"></i>
                  Sistem Ayarları
                </Link>
                <Link className={`nav-link ${isActive('/admin/reports') ? 'active' : ''}`} to="/admin/reports">
                  <i className="fas fa-chart-bar"></i>
                  Raporlar
                </Link>
                <Link className="nav-link" to="/">
                  <i className="fas fa-sign-out-alt"></i>
                  Ana Sayfaya Dön
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            <div className="admin-main-content">
              {/* Admin Header */}
              <div className="admin-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="admin-user-info me-3">
                      <div className="d-flex align-items-center">
                        <div className="admin-avatar me-2">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{user?.name || user?.username || 'Admin'}</div>
                          <small className="text-muted">Yönetici - {user?.email}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="admin-notifications">
                      <button className="btn btn-outline-secondary btn-sm position-relative">
                        <i className="fas fa-bell"></i>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          0
                        </span>
                      </button>
                    </div>
                    <div className="admin-theme-toggle">
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-moon"></i>
                      </button>
                    </div>
                                         <div className="admin-logout">
                       <button 
                         className="btn btn-outline-danger btn-sm"
                         onClick={async () => {
                           await logout();
                           navigate('/login');
                         }}
                       >
                         <i className="fas fa-sign-out-alt me-1"></i>
                         Çıkış
                       </button>
                     </div>
                  </div>
                </div>
              </div>

              {/* Page Content */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

