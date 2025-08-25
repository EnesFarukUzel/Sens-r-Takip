import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchSensors } from '../services/adminApi';
import './AdminDashboard.css';

interface Sensor {
  id: number;
  name: string;
  location: string;
  type: 'temperature' | 'humidity' | 'both';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastReading: {
    temperature?: number;
    humidity?: number;
    timestamp: string;
  };
  batteryLevel: number;
  signalStrength: number;
  firmwareVersion: string;
  installationDate: string;
}

const SensorManagement: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensors, setSelectedSensors] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSensors = async () => {
      try {
        setLoading(true);
        const data = await fetchSensors();
        setSensors(data.sensors || []);
      } catch (error) {
        console.error('Sensörler yüklenirken hata:', error);
        setSensors([]);
      } finally {
        setLoading(false);
      }
    };

    loadSensors();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Aktif</span>;
      case 'inactive':
        return <span className="badge bg-secondary">Pasif</span>;
      case 'maintenance':
        return <span className="badge bg-warning">Bakım</span>;
      case 'error':
        return <span className="badge bg-danger">Hata</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'both':
        return <span className="badge bg-primary">Sıcaklık + Nem</span>;
      case 'temperature':
        return <span className="badge bg-info">Sıcaklık</span>;
      case 'humidity':
        return <span className="badge bg-success">Nem</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 80) return 'text-success';
    if (level > 50) return 'text-warning';
    return 'text-danger';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-success';
    if (strength > 50) return 'text-warning';
    return 'text-danger';
  };

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sensor.status === filterStatus;
    const matchesType = filterType === 'all' || sensor.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSensors(filteredSensors.map(sensor => sensor.id));
    } else {
      setSelectedSensors([]);
    }
  };

  const handleSelectSensor = (sensorId: number, checked: boolean) => {
    if (checked) {
      setSelectedSensors([...selectedSensors, sensorId]);
    } else {
      setSelectedSensors(selectedSensors.filter(id => id !== sensorId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`${action} action for sensors:`, selectedSensors);
    // Backend API çağrısı yapılacak
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('tr-TR');
  };

  const stats = {
    total: sensors.length,
    active: sensors.filter(s => s.status === 'active').length,
    maintenance: sensors.filter(s => s.status === 'maintenance').length,
    error: sensors.filter(s => s.status === 'error').length,
    lowBattery: sensors.filter(s => s.batteryLevel < 30).length
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
          <h2 className="mb-1">Sensör Yönetimi</h2>
          <p className="text-muted mb-0">Tüm sensörleri görüntüle ve yönet</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-admin">
            <i className="fas fa-download me-2"></i>Rapor İndir
          </button>
          <button className="btn btn-primary btn-admin">
            <i className="fas fa-plus me-2"></i>Yeni Sensör
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
                  <p className="mb-0">Toplam Sensör</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-microchip fa-2x opacity-75"></i>
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
                  <h3 className="mb-1">{stats.active}</h3>
                  <p className="mb-0">Aktif</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x opacity-75"></i>
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
                  <h3 className="mb-1">{stats.maintenance}</h3>
                  <p className="mb-0">Bakım</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-tools fa-2x opacity-75"></i>
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
                  <h3 className="mb-1">{stats.error}</h3>
                  <p className="mb-0">Hata</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Arama</label>
              <input
                type="text"
                className="form-control"
                placeholder="Sensör adı veya konum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Durum Filtresi</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="maintenance">Bakım</option>
                <option value="error">Hata</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Tip Filtresi</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="both">Sıcaklık + Nem</option>
                <option value="temperature">Sıcaklık</option>
                <option value="humidity">Nem</option>
              </select>
            </div>
            <div className="col-md-2 mb-3">
              <label className="form-label">Toplu İşlemler</label>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => handleBulkAction('activate')}
                  disabled={selectedSensors.length === 0}
                >
                  <i className="fas fa-play me-1"></i>Aktif
                </button>
                <button 
                  className="btn btn-warning btn-sm"
                  onClick={() => handleBulkAction('maintenance')}
                  disabled={selectedSensors.length === 0}
                >
                  <i className="fas fa-tools me-1"></i>Bakım
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensors Table */}
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
                    checked={selectedSensors.length === filteredSensors.length && filteredSensors.length > 0}
                  />
                </th>
                <th>Sensör</th>
                <th>Konum</th>
                <th>Tip</th>
                <th>Durum</th>
                <th>Son Okuma</th>
                <th>Pil</th>
                <th>Sinyal</th>
                <th>Firmware</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedSensors.includes(sensor.id)}
                      onChange={(e) => handleSelectSensor(sensor.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="fw-bold">{sensor.name}</div>
                    <small className="text-muted">ID: {sensor.id}</small>
                  </td>
                  <td>{sensor.location}</td>
                  <td>{getTypeBadge(sensor.type)}</td>
                  <td>{getStatusBadge(sensor.status)}</td>
                  <td>
                    <div className="small">
                      {sensor.lastReading.temperature && (
                        <div>🌡️ {sensor.lastReading.temperature}°C</div>
                      )}
                      {sensor.lastReading.humidity && (
                        <div>💧 {sensor.lastReading.humidity}%</div>
                      )}
                      <div className="text-muted">
                        {formatTime(sensor.lastReading.timestamp)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`${getBatteryColor(sensor.batteryLevel)}`}>
                      <i className="fas fa-battery-three-quarters me-1"></i>
                      {sensor.batteryLevel}%
                    </div>
                  </td>
                  <td>
                    <div className={`${getSignalColor(sensor.signalStrength)}`}>
                      <i className="fas fa-signal me-1"></i>
                      {sensor.signalStrength}%
                    </div>
                  </td>
                  <td>
                    <code className="small">{sensor.firmwareVersion}</code>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button className="btn btn-sm btn-outline-primary" title="Düzenle">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-success" title="Aktifleştir">
                        <i className="fas fa-play"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-warning" title="Bakım">
                        <i className="fas fa-tools"></i>
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
            Toplam {filteredSensors.length} sensör gösteriliyor
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
              <a className="page-link" href="#">2</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">3</a>
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

export default SensorManagement;
