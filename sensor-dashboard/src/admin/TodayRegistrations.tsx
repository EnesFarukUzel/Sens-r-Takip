import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchTodayRegistrations } from '../services/adminApi';
import './AdminDashboard.css';

interface TodayRegistration {
  id: number;
  name: string;
  email: string;
  registrationTime: string;
  ipAddress: string;
  userAgent: string;
  status: 'pending' | 'approved' | 'rejected';
  avatar: string;
}

const TodayRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<TodayRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);

  useEffect(() => {
    const loadTodayRegistrations = async () => {
      try {
        setLoading(true);
        const data = await fetchTodayRegistrations();
        setRegistrations(data.registrations || []);
      } catch (error) {
        console.error('Kayıtlar yüklenirken hata:', error);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodayRegistrations();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success">Onaylandı</span>;
      case 'pending':
        return <span className="badge bg-warning">Beklemede</span>;
      case 'rejected':
        return <span className="badge bg-danger">Reddedildi</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-primary', 'bg-warning', 'bg-danger', 'bg-success', 'bg-info'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(registrations.map(reg => reg.id));
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectRegistration = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations([...selectedRegistrations, id]);
    } else {
      setSelectedRegistrations(selectedRegistrations.filter(regId => regId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`${action} action for registrations:`, selectedRegistrations);
    // Backend API çağrısı yapılacak
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('tr-TR');
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bugün Kayıt Olanlar</h2>
          <p className="text-muted mb-0">Bugün kayıt olan kullanıcıları yönet</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-admin">
            <i className="fas fa-download me-2"></i>Rapor İndir
          </button>
          <button className="btn btn-success btn-admin">
            <i className="fas fa-check me-2"></i>Toplu Onay
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
                  <h3 className="mb-1">{stats.total}</h3>
                  <p className="mb-0">Toplam Kayıt</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x opacity-75"></i>
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
                  <h3 className="mb-1">{stats.pending}</h3>
                  <p className="mb-0">Beklemede</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x opacity-75"></i>
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
                  <h3 className="mb-1">{stats.approved}</h3>
                  <p className="mb-0">Onaylandı</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stat-card danger">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1">{stats.rejected}</h3>
                  <p className="mb-0">Reddedildi</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-times-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRegistrations.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">
                {selectedRegistrations.length} kayıt seçildi
              </span>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => handleBulkAction('approve')}
                >
                  <i className="fas fa-check me-1"></i>Toplu Onay
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleBulkAction('reject')}
                >
                  <i className="fas fa-times me-1"></i>Toplu Red
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedRegistrations.length === registrations.length && registrations.length > 0}
                  />
                </th>
                <th>Kullanıcı</th>
                <th>Email</th>
                <th>Kayıt Zamanı</th>
                <th>IP Adresi</th>
                <th>Tarayıcı</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedRegistrations.includes(registration.id)}
                      onChange={(e) => handleSelectRegistration(registration.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${getAvatarColor(registration.name)}`} style={{width: '35px', height: '35px'}}>
                        <span className="text-white fw-bold">{registration.avatar}</span>
                      </div>
                      <div>
                        <div className="fw-bold">{registration.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{registration.email}</td>
                  <td>{formatTime(registration.registrationTime)}</td>
                  <td>
                    <code className="small">{registration.ipAddress}</code>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {registration.userAgent.split('/')[0]}
                    </span>
                  </td>
                  <td>{getStatusBadge(registration.status)}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <button className="btn btn-sm btn-outline-success" title="Onayla">
                        <i className="fas fa-check"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Reddet">
                        <i className="fas fa-times"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-info" title="Detaylar">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <p className="text-muted mb-0">
            Toplam {registrations.length} kayıt gösteriliyor
          </p>
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className="page-item disabled">
              <a className="page-link" href="#" tabIndex={-1}>Önceki</a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">1</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">Sonraki</a>
            </li>
          </ul>
        </nav>
      </div>
    </AdminLayout>
  );
};

export default TodayRegistrations;
