import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import SensorCard from '../components/SensorCard';
import AlertNotification from '../components/AlertNotification';
import { Line } from 'react-chartjs-2';
import { fetchSensorData, getLatestSensorData, SensorData, isDataFromCache, getCacheTimestamp } from '../services/api';
import { 
  calculateStats, 
  generateChartData, 
  checkAlerts, 
  Alert, 
  AlertConfig,
  calculateTrend,
  detectAnomalies,
  calculateCorrelation,
  generatePredictionChart,
  TrendData,
  AnomalyResult,
  CorrelationResult
} from '../services/dataAnalysis';
import { notificationService } from '../services/notificationService';

import { useNavigate } from 'react-router-dom';
import Select, { GroupBase, StylesConfig } from 'react-select';
import SensorLiveChart from '../components/SensorLiveChart';
import { showToken, showTokenFromStorage } from '../services/auth';

const customStyles: StylesConfig<{ value: string; label: React.ReactNode }, false, GroupBase<{ value: string; label: React.ReactNode }>> = {
  control: (provided) => ({
    ...provided,
    borderRadius: 8,
    borderColor: '#d0d7de',
    boxShadow: 'none',
    minHeight: 48,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#e0f2fe'
      : state.isFocused
      ? '#f1f5f9'
      : '#fff',
    color: '#222',
    fontWeight: state.isSelected ? 'bold' : 'normal',
    fontSize: 15,
    padding: 12,
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#64748b',
    fontSize: 15,
  }),
};

const Dashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('lastSensorData');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [allData, setAllData] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('lastSensorData');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AlertConfig>({
    tempMin: 20,
    tempMax: 26,
    humMin: 40,
    humMax: 60
  });

  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationResult | null>(null);
  const [temperatureTrend, setTemperatureTrend] = useState<TrendData | null>(null);
  const [humidityTrend, setHumidityTrend] = useState<TrendData | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  // Çoklu seçim için state
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);

  const navigate = useNavigate();

  // Sensör listesi (backend'den gelecek)
  const [sensorList, setSensorList] = useState<Array<{ value: string; label: React.ReactNode }>>([]);

  // Ayarları yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sensör listesini yükle
  useEffect(() => {
    const fetchSensorList = async () => {
      try {
        // TODO: Backend API çağrısı burada yapılacak
        // const response = await fetch('/api/sensors');
        // const data = await response.json();
        // const formattedList = data.map((sensor: any) => ({
        //   value: sensor.id,
        //   label: (
        //     <span>
        //       <i className="bi bi-cpu me-2 text-primary"></i>
        //       {sensor.name}
        //     </span>
        //   )
        // }));
        // setSensorList(formattedList);
        
        console.log('Sensör listesi yükleniyor...');
      } catch (error) {
        console.error('Sensör listesi yüklenirken hata:', error);
      }
    };

    fetchSensorList();
  }, []);

  // Bildirim izni iste
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const performAdvancedAnalysis = (data: SensorData[]) => {
    if (data.length < 3) return;
    setAnomalies(detectAnomalies(data, 2));
    setTemperatureTrend(calculateTrend(data, 'temperature'));
    setHumidityTrend(calculateTrend(data, 'humidity'));
  };

  // API'den veri çekme fonksiyonu
  const loadSensorData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Dashboard: Veri yükleme başlatılıyor...');
      
      const data = await fetchSensorData();
      console.log('📊 Dashboard: API\'den gelen veri:', data.length, 'kayıt');
      
      if (data.length === 0) {
        console.warn('⚠️ Dashboard: API\'den veri gelmedi!');
        setError('Veri bulunamadı. Lütfen daha sonra tekrar deneyin.');
        return;
      }
      
      // Backend verilerini karşılaştır
      console.log('🔍 Backend veri karşılaştırması:');
      if (data.length > 0) {
        const firstData = data[0];
        console.log('�� İlk veri örneği:', {
          id: firstData.id,
          temperature: firstData.temperature,
          humidity: firstData.humidity,
          measurementTime: firstData.measurementTime,
          measurement_time: firstData.measurement_time,
          sensorId: firstData.sensorId
        });
        
        // Bugün için veri sayısını kontrol et
        const today = new Date();
        const todayData = data.filter(item => {
          const measurementTime = new Date(item.measurement_time || item.measurementTime);
          return measurementTime.getFullYear() === today.getFullYear() &&
                 measurementTime.getMonth() === today.getMonth() &&
                 measurementTime.getDate() === today.getDate();
        });
        console.log('📊 Bugün için API\'den gelen veri sayısı:', todayData.length);
        
        // Son 5 veriyi göster
        console.log('📊 Son 5 veri:');
        data.slice(0, 5).forEach((item, index) => {
          console.log(`  ${index + 1}. ID: ${item.id}, Sıcaklık: ${item.temperature}°C, Nem: ${item.humidity}%, Zaman: ${item.measurement_time || item.measurementTime}`);
        });
      }
      
      // Tüm verileri göster, sadece son 2 değil
      setAllData(data);
      setSensorData(data);
      
      console.log('✅ Dashboard: Veriler başarıyla yüklendi');
      console.log('📊 allData state güncellendi:', data.length, 'kayıt');
      
      console.log('✅ Yeni veri başarıyla yüklendi');
      
      setError(null);
    } catch (err) {
      console.error('❌ Dashboard API hatası:', err);
      setError('Veri yükleme hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
      
      // Cache'den veri kullan
      const cachedData = JSON.parse(localStorage.getItem('lastSensorData') || '[]');
      if (cachedData.length > 0) {
        console.log('🔄 Cache\'den veri kullanılıyor (hata durumunda)');
        setAllData(cachedData);
        setSensorData(cachedData);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Dashboard: Veri yükleme tamamlandı');
    }
  };

  // useEffect ile ilk açılışta ve periyodik olarak veri çek
  useEffect(() => {
    console.log('🚀 Dashboard: İlk yükleme başlatılıyor...');
    console.log('⏰ Dashboard: 2 dakikalık interval ayarlanıyor...');
    
    // İlk veri çekme
    loadSensorData();
    
    // 2 dakikada bir güncelle (daha az sıklıkta güncelleme)
    const interval = setInterval(() => {
      console.log('⏰ Dashboard: Periyodik veri güncelleme başlatılıyor...');
      console.log('📅 Güncelleme zamanı:', new Date().toLocaleString('tr-TR'));
      loadSensorData();
    }, 120000); // 2 dakika (120 saniye)
    
    console.log('✅ Dashboard: Interval başarıyla ayarlandı (120 saniye)');
    
    return () => {
      console.log('🛑 Dashboard: Interval temizleniyor...');
      clearInterval(interval);
    };
  }, []);



  useEffect(() => {
    console.log('📊 Dashboard: allData güncellendi:', allData.length, 'kayıt');
  }, [allData]);



  // Ayarlar sayfasına yönlendirme
  const handleGoToSettings = (sensorId: string) => {
    navigate(`/settings?sensor=${sensorId}`);
  };

  // Sensör seçimi için varsayılanı ayarla
  useEffect(() => {
    setSelectedSensorIds(['101']);
  }, []);

  // Sensör seçeneklerini react-select formatına dönüştür
  const sensorOptions = [
    {
      value: '101',
      label: (
        <span>
          <i className="bi bi-cpu me-2 text-primary"></i>
          Sensör 101
        </span>
      )
    }
  ];

  // Dashboard kartları için state
  type DashboardCard = {
    sensorId: string;
    visible: boolean;
    order: number;
  };

  const initialCards: DashboardCard[] = [
    { sensorId: '1', visible: true, order: 0 },
    { sensorId: '2', visible: true, order: 1 },
    { sensorId: '3', visible: false, order: 2 },
    // ...diğer sensörler
  ];

  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(initialCards);

  const handleRemoveCard = (sensorId: string) => {
    setDashboardCards(cards =>
      cards.map(card =>
        card.sensorId === sensorId ? { ...card, visible: false } : card
      )
    );
  };

  const handleAddCard = (sensorId: string) => {
    setDashboardCards(cards =>
      cards.map(card =>
        card.sensorId === sensorId ? { ...card, visible: true } : card
      )
    );
  };

  // Bugünün verilerini gösteren grafik kartı - TÜMÜ KALDIRILDI
  // const TodayAnalyticsChart = () => { ... };

  // Sensör ayarları modalı için state ekleme
  const [showSensorSettings, setShowSensorSettings] = useState(false);
  const [sensorSettings, setSensorSettings] = useState({
    name: 'Sensör 101',
    location: 'Depo',
    description: 'Ana depo sıcaklık ve nem sensörü'
  });

  // Sensör ayarlarını kaydetme fonksiyonu
  const handleSaveSensorSettings = () => {
    localStorage.setItem('sensorSettings_101', JSON.stringify(sensorSettings));
    setShowSensorSettings(false);
    
    // notificationService.show yerine doğru metod adını kullan
    // Eğer notificationService'de farklı bir metod varsa:
    // notificationService.showNotification('Sensör ayarları güncellendi!', 'success');
    // veya 
    // notificationService.notify('Sensör ayarları güncellendi!', 'success');
    
    // Geçici olarak console.log ile test edelim:
    console.log('Sensör ayarları güncellendi!');
    
    // Veya browser notification kullanabiliriz:
    if (Notification.permission === 'granted') {
      new Notification('Başarılı', {
        body: 'Sensör ayarları güncellendi!',
        icon: '/favicon.ico'
      });
    }
  };

  // Sensör ayarlarını yükleme
  useEffect(() => {
    const savedSensorSettings = localStorage.getItem('sensorSettings_101');
    if (savedSensorSettings) {
      setSensorSettings(JSON.parse(savedSensorSettings));
    }
  }, []);

  // Alerts state'ini güvenli şekilde güncelle
  const updateAlerts = (newAlerts: Alert[]) => {
    if (Array.isArray(newAlerts)) {
      setAlerts(newAlerts);
    } else {
      console.warn('⚠️ Alerts geçersiz format:', newAlerts);
      setAlerts([]);
    }
  };

  // Alert kontrolü için useEffect düzelt
  useEffect(() => {
    if (allData.length > 0) {
      // En son veriler ile alarm kontrolü yap
      const sensorAllData = allData
        .filter(s => String(s.sensorId) === '101')
        .sort((a, b) => new Date(b.measurementTime).getTime() - new Date(a.measurementTime).getTime());
      
      if (sensorAllData.length > 0) {
        // Her bir veri için ayrı ayrı alarm kontrolü yap
        const allGeneratedAlerts: Alert[] = [];
        
        sensorAllData.forEach(sensorData => {
          const singleDataAlerts = checkAlerts(sensorData, settings);
          allGeneratedAlerts.push(...singleDataAlerts);
        });
        
        // Tekrarlayan alarmları filtrele (aynı type ve status için)
        const uniqueAlerts = allGeneratedAlerts.filter((alert, index, self) => 
          index === self.findIndex(a => 
            a.type === alert.type && 
            a.status === alert.status && 
            a.sensorId === alert.sensorId
          )
        );
        
        updateAlerts(uniqueAlerts.slice(0, 10)); // Son 10 alarmı tut
        
        console.log('Alarm kontrolü yapıldı:', {
          processedData: sensorAllData.length,
          settings: settings,
          alerts: uniqueAlerts.length
        });
      }
    }
  }, [allData, settings]);

  // Eşik değerlerini normal değerlere geri döndür
  useEffect(() => {
    // Normal prodüksiyon eşik değerleri
    const normalSettings = {
      tempMin: 20, // Normal minimum
      tempMax: 26, // Normal maksimum  
      humMin: 40, // Normal minimum
      humMax: 60  // Normal maksimum
    };
    setSettings(normalSettings);
    console.log('Normal eşik değerleri ayarlandı:', normalSettings);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="loading-shimmer rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}></div>
          <h5 className="text-muted">Sensör verileri yükleniyor...</h5>
          <p className="text-muted mb-0">Bu işlem birkaç saniye sürebilir</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="app-card fade-in">
          <div className="app-card-body text-center">
            <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-3 text-danger">Bağlantı Hatası</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="btn btn-primary" onClick={loadSensorData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats(allData);
  const chartData = {
    labels: allData.map(d => {
      const t = new Date(d.measurement_time || d.measurementTime);
      return `${t.toLocaleDateString('tr-TR')} ${t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    }),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: allData.map(d => d.temperature),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.2)',
        yAxisID: 'y',
        pointRadius: 4,
        tension: 0.4,
      },
      {
        label: 'Nem (%)',
        data: allData.map(d => d.humidity),
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.2)',
        yAxisID: 'y',
        pointRadius: 4,
        tension: 0.4,
      }
    ]
  };

  const sensorId = '101';
  const filteredData = allData.filter(s => String(s.id) === sensorId);
  const sensor = filteredData[filteredData.length - 1];
  const sensorTrend = filteredData
    .slice(-6)
    .map(s => ({
      time: new Date(s.measurement_time || s.measurementTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      value: s.temperature ?? 0
    }));

  return (
    <div className="container-fluid">
      {/* ÜST PANEL */}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">Sensör Dashboard</h4>
            <p className="text-muted mb-0">Gerçek zamanlı sensör verileri</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-outline-info"
              onClick={() => {
                console.log('🔍 DEBUG: Veri durumu kontrol ediliyor...');
                console.log('📊 allData length:', allData.length);
                console.log('📊 sensorData length:', sensorData.length);
                console.log('📊 localStorage lastSensorData:', localStorage.getItem('lastSensorData'));
                console.log('📊 İlk 3 veri:', allData.slice(0, 3));
                loadSensorData();
              }}
              title="Veri durumunu kontrol et"
            >
              <i className="bi bi-bug"></i>
              Debug
            </button>
          </div>
        </div>

        {/* Sensör Seçimi */}
        <div className="row mb-4">
          <div className="col-12 col-lg-6 mb-3 mb-lg-0">
            <label className="form-label fw-bold">Sensör Seç:</label>
            <Select<{ value: string; label: React.ReactNode }, false>
              options={sensorOptions}
              value={sensorOptions.find(opt => opt.value === '101')}
              onChange={(selected) => {
                if (selected) setSelectedSensorIds([selected.value]);
              }}
              placeholder="Sensör seçiniz..."
              classNamePrefix="react-select"
              styles={customStyles}
            />
            <small className="text-muted">Şu an sadece bir sensör mevcut.</small>
          </div>
        </div>
      </div>



      {/* Test modu alert'ini kaldır */}


      {/* Ana Grid: Sol ve Sağ Panel */}
      <div className="row g-4">
        {/* SOL PANEL */}
        <div className="col-12 col-xl-8">
          {/* Sensör Kartları */}
          <div className="row g-4 mb-4">
            {(() => {
              const sensorAllData = allData
                .filter(s => String(s.sensorId) === '101')
                .sort((a, b) => new Date(b.measurementTime).getTime() - new Date(a.measurementTime).getTime());
              if (sensorAllData.length === 0) return null;
              const latestSensor = sensorAllData[0];
              
              return (
                <div className="col-12" key={'101'}>
                  <SensorCard
                    id={'101'}
                    name={`Sensör 101`}
                    temperature={latestSensor?.temperature}
                    humidity={latestSensor?.humidity}
                    timestamp={latestSensor?.measurementTime || ''}
                    thresholds={settings}
                    alerts={alerts.filter(a => String(a.sensorId) === '101')}
                    onGoToSettings={handleGoToSettings}
                    trendData={[]}
                  />
                  
                  {/* Bugünün Trend Analizi - KALDIRILDI */}
                  {/* <TodayAnalyticsChart /> */}
                  
                  {/* Canlı Grafik */}
                  <div className="app-card mt-3">
                    <div className="app-card-header">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-activity text-primary"></i>
                        <h6 className="mb-0">Canlı Sıcaklık & Nem Grafiği (Son 20 Ölçüm)</h6>
                      </div>
                    </div>
                    <div className="app-card-body">
                      <SensorLiveChart data={allData} />
                    </div>
                  </div>
                  
                  {/* Dinamik Ölçüm Tablosu */}
                  <div className="app-card mt-3">
                    <div className="app-card-header">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-table text-primary"></i>
                        <h6 className="mb-0">Tüm Ölçümler Tablosu</h6>
                        <span className="badge bg-primary ms-auto">{allData.length} ölçüm</span>
                      </div>
                    </div>
                    <div className="app-card-body p-0">
                      {allData.length === 0 ? (
                        <div className="text-center p-4">
                          <i className="bi bi-exclamation-circle text-muted" style={{ fontSize: '2rem' }}></i>
                          <p className="text-muted mt-2 mb-0">Henüz veri yok</p>
                          <small className="text-muted">2 dakikada bir güncellenir</small>
                        </div>
                      ) : (
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                          <table className="table table-sm mb-0">
                            <thead className="table-light sticky-top">
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Zaman</th>
                                <th scope="col">Sıcaklık (°C)</th>
                                <th scope="col">Nem (%)</th>
                                <th scope="col">Sensör ID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                console.log('📊 Tablo render - allData:', allData.length, 'kayıt');
                                const sortedData = allData
                                  .sort((a, b) => {
                                    const dateA = new Date(a.measurement_time || a.measurementTime);
                                    const dateB = new Date(b.measurement_time || b.measurementTime);
                                    return dateB.getTime() - dateA.getTime(); // En yeni önce
                                  });
                                console.log('📊 Tablo render - sortedData:', sortedData.length, 'kayıt');
                                
                                // Tablo verilerini kontrol et
                                if (sortedData.length > 0) {
                                  console.log('📊 Tablo - İlk 3 veri:');
                                  sortedData.slice(0, 3).forEach((item, index) => {
                                    console.log(`  ${index + 1}. ID: ${item.id}, Sıcaklık: ${item.temperature}, Nem: ${item.humidity}, Zaman: ${item.measurement_time || item.measurementTime}`);
                                  });
                                }
                                
                                return sortedData.map((d, i) => (
                                  <tr key={d.id || i} className={i < 5 ? 'table-primary' : ''}>
                                    <td>{i + 1}</td>
                                    <td>{new Date(d.measurement_time || d.measurementTime).toLocaleString('tr-TR')}</td>
                                    <td className="fw-bold">{d.temperature?.toFixed(2)}</td>
                                    <td className="fw-bold">{d.humidity?.toFixed(2)}</td>
                                    <td>{d.sensorId || 'N/A'}</td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="col-12 col-xl-4">
          {/* Sensör Bilgileri - Düzenleme butonu ile */}
          {(() => {
            const sensorAllData = allData
              .filter(s => String(s.sensorId) === '101')
              .sort((a, b) => {
                const dateA = new Date(a.measurement_time || a.measurementTime);
                const dateB = new Date(b.measurement_time || b.measurementTime);
                return dateB.getTime() - dateA.getTime();
              });
            if (sensorAllData.length === 0) return null;
            const latestSensor = sensorAllData[0];
            
            const isToday = (dateStr: string) => {
              try {
                const d = new Date(dateStr);
                const now = new Date();
                const isTodayResult = d.getFullYear() === now.getFullYear() &&
                       d.getMonth() === now.getMonth() &&
                       d.getDate() === now.getDate();
                
                console.log(`📅 Tarih kontrolü: ${dateStr} -> ${d.toLocaleString('tr-TR')} -> Bugün mü: ${isTodayResult}`);
                
                return isTodayResult;
              } catch (error) {
                console.error('Date parsing error:', error);
                return false;
              }
            };
            
            // Bugün için veri sayısını hesapla
            const todayData = sensorAllData.filter(d => {
              const measurementTime = d.measurement_time || d.measurementTime;
              return isToday(measurementTime);
            });
            const dailyCount = todayData.length;
            
            console.log('📊 Sensör bilgileri - Bugün için veri sayısı:', dailyCount);
            console.log('📊 Sensör bilgileri - Toplam veri sayısı:', sensorAllData.length);
            console.log('📊 Sensör bilgileri - Son veri zamanı:', latestSensor ? (latestSensor.measurement_time || latestSensor.measurementTime) : 'Yok');
            
            // Bugün için verilerin detayını göster
            if (todayData.length > 0) {
              console.log('📊 Bugün için veriler:');
              todayData.slice(0, 3).forEach((item, index) => {
                const measurementTime = item.measurement_time || item.measurementTime;
                console.log(`  ${index + 1}. ${measurementTime} - Sıcaklık: ${item.temperature}°C, Nem: ${item.humidity}%`);
              });
            } else {
              console.log('⚠️ Bugün için veri bulunamadı!');
            }
            
            return (
              <div className="app-card fade-in stagger-delay-1 mb-4" style={{ position: 'relative' }}>
                <div className="app-card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-cpu text-primary"></i>
                      <h5 className="mb-0">Sensör Bilgileri</h5>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowSensorSettings(true)}
                      title="Sensör ayarlarını düzenle"
                      style={{ zIndex: 1050 }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
                </div>
                <div className="app-card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="fw-bold">Sensör Adı:</div>
                      <div>{sensorSettings.name}</div>
                    </div>
                    <div className="col-12">
                      <div className="fw-bold">ID:</div>
                      <div>101</div>
                    </div>
                    <div className="col-12">
                      <div className="fw-bold">Konum:</div>
                      <div>{sensorSettings.location}</div>
                    </div>
                    <div className="col-12">
                      <div className="fw-bold">Açıklama:</div>
                      <div className="text-muted small">{sensorSettings.description}</div>
                    </div>
                    <div className="col-12">
                      <div className="fw-bold">Günlük Ölçüm Sayısı:</div>
                      <div>{dailyCount}</div>
                    </div>
                    <div className="col-12">
                      <div className="fw-bold">Son Güncelleme:</div>
                      <div>{latestSensor ? new Date(latestSensor.measurement_time || latestSensor.measurementTime).toLocaleString('tr-TR') : '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Hızlı Metrikler */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="metric-card interactive-card fade-in stagger-delay-1">
                <div className="metric-icon text-danger">
                  <i className="bi bi-thermometer-high"></i>
                </div>
                <div className="metric-value">{stats.avgTemp.toFixed(1)}°C</div>
                <div className="metric-label">Ortalama Sıcaklık</div>
                <div className="mt-2">
                  <small className="text-muted">
                    {stats.minTemp.toFixed(1)}°C - {stats.maxTemp.toFixed(1)}°C
                  </small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="metric-card interactive-card fade-in stagger-delay-2">
                <div className="metric-icon text-info">
                  <i className="bi bi-droplet-fill"></i>
                </div>
                <div className="metric-value">{stats.avgHum.toFixed(1)}%</div>
                <div className="metric-label">Ortalama Nem</div>
                <div className="mt-2">
                  <small className="text-muted">
                    {stats.minHum.toFixed(1)}% - {stats.maxHum.toFixed(1)}%
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Detaylı İstatistikler */}
          <div className="app-card fade-in stagger-delay-3 mb-4">
            <div className="app-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up text-primary"></i>
                <h6 className="mb-0">Detaylı İstatistikler</h6>
              </div>
            </div>
            <div className="app-card-body">
              {(() => {
                // Güncel verileri kullan
                const sensorAllData = allData
                  .filter(s => String(s.sensorId) === '101')
                  .sort((a, b) => new Date(b.measurementTime).getTime() - new Date(a.measurementTime).getTime());
                
                if (sensorAllData.length === 0) {
                  return (
                    <div className="text-center text-muted py-3">
                      <i className="bi bi-info-circle"></i>
                      <p className="mb-0">Henüz veri bulunmuyor</p>
                    </div>
                  );
                }

                // İstatistikleri hesapla
                const latestData = sensorAllData[0];
                const oldestData = sensorAllData[sensorAllData.length - 1];
                
                // Bugünün verilerini say
                const today = new Date();
                const todayCount = sensorAllData.filter(d => {
                  const date = new Date(d.measurementTime);
                  return date.toDateString() === today.toDateString();
                }).length;

                // Aktif gün sayısını hesapla (ilk veri ile şimdi arasındaki gün)
                const firstDataDate = new Date(oldestData.measurementTime);
                const activeDays = Math.ceil((today.getTime() - firstDataDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

                // Son 24 saatteki anomali sayısı
                const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const recentAnomalies = anomalies.filter(a => 
                  new Date(a.timestamp) > last24Hours
                ).length;

                return (
                  <>
                    <div className="row g-3 text-center">
                      <div className="col-4">
                        <div className="metric-value small text-primary">{sensorAllData.length}</div>
                        <div className="metric-label">Toplam Ölçüm</div>
                      </div>
                      <div className="col-4">
                        <div className="metric-value small text-info">{todayCount}</div>
                        <div className="metric-label">Bugün</div>
                      </div>
                      <div className="col-4">
                        <div className="metric-value small text-warning">{recentAnomalies}</div>
                        <div className="metric-label">24s Anomali</div>
                      </div>
                    </div>
                    
                    <hr className="my-3" />
                    
                    <div className="row g-3 text-center">
                      <div className="col-6">
                        <div className="metric-value small text-success">{activeDays}</div>
                        <div className="metric-label">Aktif Gün</div>
                      </div>
                      <div className="col-6">
                        <div className="metric-value small text-secondary">
                          {Math.round(sensorAllData.length / activeDays)}
                        </div>
                        <div className="metric-label">Günlük Ort.</div>
                      </div>
                    </div>
                    
                    <hr className="my-3" />
                    
                    <div className="text-center">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Son güncelleme: {new Date(latestData.measurementTime).toLocaleString('tr-TR')}
                      </small>
                      <br />
                      <small className="text-muted">
                        <i className="bi bi-calendar-event me-1"></i>
                        İlk veri: {new Date(oldestData.measurementTime).toLocaleDateString('tr-TR')}
                      </small>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Anomali Tespitleri - Düzeltilmiş */}
          {anomalies.length > 0 && (
            <div className="app-card fade-in stagger-delay-4 mb-4">
              <div className="app-card-header">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-triangle text-warning"></i>
                    <h6 className="mb-0">Son Anomaliler</h6>
                  </div>
                  <span className="badge bg-warning-subtle text-warning-emphasis">
                    {anomalies.length}
                  </span>
                </div>
              </div>
              <div className="app-card-body">
                <div className="list-group list-group-flush">
                  {anomalies.map((anomaly, index) => (
                    <div key={`anomaly-${index}`} className={`list-group-item py-3 ${index % 2 === 0 ? 'bg-light' : ''}`}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div>
                            <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                          <div>
                            <div className="text-warning fw-medium">
                              {anomaly.type === 'temperature' ? 'Sıcaklık' : 'Nem'} Anomali Tespiti
                            </div>
                            <div className="text-muted small">
                              {new Date(anomaly.timestamp).toLocaleString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="badge rounded-pill bg-warning">
                            Anomali
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="fw-bold">
                          Değer: {anomaly.value.toFixed(1)} {anomaly.type === 'temperature' ? '°C' : '%'}
                        </div>
                        <div className="text-muted small">
                          Beklenen aralık dışında değer tespit edildi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Aktif Alarmlar - Normal mod */}
          <div className="app-card fade-in stagger-delay-4">
            <div className="app-card-header">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${alerts.length > 0 ? 'bi-bell-fill text-danger' : 'bi-bell text-muted'}`}></i>
                  <h6 className="mb-0">Aktif Alarmlar</h6>
                </div>
                {alerts.length > 0 && (
                  <span className="badge bg-danger text-white">
                    {alerts.length}
                  </span>
                )}
              </div>
            </div>
            <div className="app-card-body">
              {alerts.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle text-success fs-1"></i>
                  <p className="text-muted mt-2 mb-0">Aktif alarm bulunmuyor</p>
                  <small className="text-muted">
                    Tüm değerler normal aralıkta <br/>
                    (Sıcaklık: {settings.tempMin}-{settings.tempMax}°C, Nem: {settings.humMin}-{settings.humMax}%)
                  </small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {alerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex align-items-start gap-2">
                          <span className={`badge bg-${alert.status === 'high' ? 'danger' : 'warning'} text-white mt-1`}>
                            {alert.type === 'temperature' ? '🌡️' : '💧'}
                          </span>
                          <div>
                            <div className="fw-medium small">
                              {alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'} 
                              <span className={`text-${alert.status === 'high' ? 'danger' : 'warning'} ms-1`}>
                                {alert.status === 'high' ? '⬆️ Yüksek' : '⬇️ Düşük'}
                              </span>
                            </div>
                            <div className="text-muted small">
                              Değer: <strong>{alert.value.toFixed(1)}{alert.type === 'temperature' ? '°C' : '%'}</strong>
                            </div>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {new Date(alert.timestamp).toLocaleString('tr-TR')}
                            </small>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                          title="Alarmı kapat"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {alerts.length > 5 && (
                    <div className="text-center pt-2">
                      <small className="text-muted">
                        +{alerts.length - 5} diğer alarm var
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sensör Ayarları Modalı */}
      {showSensorSettings && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-gear me-2"></i>
                  Sensör Ayarları
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowSensorSettings(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="sensorName" className="form-label">
                      <i className="bi bi-tag me-1"></i>
                      Sensör Adı
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="sensorName"
                      value={sensorSettings.name}
                      onChange={(e) => setSensorSettings(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Sensör adını girin"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="sensorLocation" className="form-label">
                      <i className="bi bi-geo-alt me-1"></i>
                      Konum
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="sensorLocation"
                      value={sensorSettings.location}
                      onChange={(e) => setSensorSettings(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Sensörün konumunu girin"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="sensorDescription" className="form-label">
                      <i className="bi bi-card-text me-1"></i>
                      Açıklama
                    </label>
                    <textarea
                      className="form-control"
                      id="sensorDescription"
                      rows={3}
                      value={sensorSettings.description}
                      onChange={(e) => setSensorSettings(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Sensör hakkında açıklama yazın"
                    />
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Not:</strong> ID değeri sistem tarafından otomatik olarak atanır ve değiştirilemez.
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSensorSettings(false)}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  İptal
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveSensorSettings}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Notification */}
      {Array.isArray(alerts) && alerts.length > 0 && (
        <AlertNotification alerts={alerts} />
      )}
    </div>
  );
};

export default Dashboard;