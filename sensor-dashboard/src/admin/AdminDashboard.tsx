import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../services/adminApi';
import './AdminDashboard.css';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  registrationDate: string;
  lastLogin: string;
  avatar: string;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface SystemAlert {
  id: number;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayRegistrations: 0,
    pendingApprovals: 0,
    activeSensors: 0,
    totalSensors: 0,
    systemUptime: 0,
    dataStorage: 0,
    activeAlerts: 0
  });

  // Backend'den veri çekme
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setUsers(data.users || []);
        setActivities(data.activities || []);
        setAlerts(data.alerts || []);
        setStats(data.stats || {
          totalUsers: 0,
          todayRegistrations: 0,
          pendingApprovals: 0,
          activeSensors: 0,
          totalSensors: 0,
          systemUptime: 0,
          dataStorage: 0,
          activeAlerts: 0
        });
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
        // Hata durumunda boş veriler göster
        setUsers([]);
        setActivities([]);
        setAlerts([]);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Tamamlandı</span>;
      case 'pending':
        return <span className="badge bg-warning">Beklemede</span>;
      case 'failed':
        return <span className="badge bg-danger">Başarısız</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <span className="badge bg-warning">Uyarı</span>;
      case 'error':
        return <span className="badge bg-danger">Hata</span>;
      case 'info':
        return <span className="badge bg-info">Bilgi</span>;
      case 'success':
        return <span className="badge bg-success">Başarı</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="badge bg-danger">Yüksek</span>;
      case 'medium':
        return <span className="badge bg-warning">Orta</span>;
      case 'low':
        return <span className="badge bg-info">Düşük</span>;
      default:
        return <span className="badge bg-secondary">{priority}</span>;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-primary', 'bg-warning', 'bg-danger', 'bg-success', 'bg-info'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'text-success';
    if (uptime >= 98) return 'text-warning';
    return 'text-danger';
  };

  const getStorageColor = (storage: number) => {
    if (storage < 70) return 'text-success';
    if (storage < 90) return 'text-warning';
    return 'text-danger';
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Sistem genel durumu ve istatistikler</p>
          {user && (
            <div className="mt-2">
              <span className="badge bg-success fs-6">
                <i className="fas fa-user-shield me-2"></i>
                Hoş geldin, {user.name || user.username}!
              </span>
            </div>
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-admin">
            <i className="fas fa-download me-2"></i>Rapor İndir
          </button>
          <button className="btn btn-primary btn-admin">
            <i className="fas fa-plus me-2"></i>Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1">{stats.totalUsers.toLocaleString()}</h3>
                  <p className="mb-0">Toplam Kullanıcı</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stat-card success">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1">{stats.todayRegistrations}</h3>
                  <p className="mb-0">Bugün Kayıt Olan</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-user-plus fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stat-card warning">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1">{stats.pendingApprovals}</h3>
                  <p className="mb-0">Onay Bekleyen</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stat-card info">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1">{stats.activeSensors}</h3>
                  <p className="mb-0">Aktif Sensör</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-microchip fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title">Sistem Uptime</h6>
              <h3 className={`${getUptimeColor(stats.systemUptime)}`}>
                {stats.systemUptime}%
              </h3>
              <div className="progress" style={{height: '8px'}}>
                <div className="progress-bar bg-success" style={{width: `${stats.systemUptime}%`}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title">Veri Depolama</h6>
              <h3 className={`${getStorageColor(stats.dataStorage)}`}>
                {stats.dataStorage}%
              </h3>
              <div className="progress" style={{height: '8px'}}>
                <div className={`progress-bar ${getStorageColor(stats.dataStorage).replace('text-', 'bg-')}`} style={{width: `${stats.dataStorage}%`}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title">Toplam Sensör</h6>
              <h3 className="text-primary">{stats.totalSensors}</h3>
              <small className="text-muted">
                {stats.activeSensors} aktif / {stats.totalSensors - stats.activeSensors} pasif
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title">Aktif Uyarılar</h6>
              <h3 className="text-warning">{stats.activeAlerts}</h3>
              <small className="text-muted">
                Sistem uyarıları
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="table-container">
            <h5 className="mb-3">
              <i className="fas fa-history me-2"></i>
              Son Aktiviteler
            </h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>İşlem</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${getAvatarColor(activity.user)}`} style={{width: '35px', height: '35px'}}>
                            <span className="text-white fw-bold">{activity.user.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="fw-bold">{activity.user}</div>
                          </div>
                        </div>
                      </td>
                      <td>{activity.action}</td>
                      <td>{activity.timestamp}</td>
                      <td>{getStatusBadge(activity.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="fas fa-bolt me-2"></i>
                Hızlı İşlemler
              </h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-admin">
                  <i className="fas fa-user-plus me-2"></i>
                  Yeni Kullanıcı Ekle
                </button>
                <button className="btn btn-outline-success btn-admin">
                  <i className="fas fa-check-circle me-2"></i>
                  Toplu Onay
                </button>
                <button className="btn btn-outline-warning btn-admin">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Sistem Uyarıları
                </button>
                <button className="btn btn-outline-info btn-admin">
                  <i className="fas fa-chart-bar me-2"></i>
                  Rapor Oluştur
                </button>
                <button className="btn btn-outline-secondary btn-admin">
                  <i className="fas fa-microchip me-2"></i>
                  Sensör Yönetimi
                </button>
              </div>
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Sistem Uyarıları
              </h5>
              <div className="d-grid gap-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="alert alert-sm alert-light border">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold small">{alert.message}</div>
                        <small className="text-muted">{alert.timestamp}</small>
                      </div>
                      <div className="d-flex gap-1">
                        {getAlertBadge(alert.type)}
                        {getPriorityBadge(alert.priority)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="fas fa-chart-pie me-2"></i>
                Sistem Durumu
              </h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>CPU Kullanımı</span>
                  <span>65%</span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-success" style={{width: '65%'}}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>RAM Kullanımı</span>
                  <span>42%</span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-info" style={{width: '42%'}}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Disk Kullanımı</span>
                  <span>78%</span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-warning" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
