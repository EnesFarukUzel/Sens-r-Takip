import { getAuthHeaders } from './auth';

export interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  measurementTime: string;
  measurement_time: string;
  sensorId: number;
}

// Admin Panel için interface'ler
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
}

export interface UpdateUserRequest {
  id: number;
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  name?: string;
  status?: 'active' | 'inactive' | 'pending';
}

// Backend URL'leri
const BACKEND_BASE_URL = 'https://8f96270909e9.ngrok-free.app';

// 1. LOGIN URL (auth.ts'de zaten mevcut)
// 2. SENSOR DATA URL
// 3. ADMIN PANEL URL'leri

// Cache key for localStorage
const CACHE_KEY = 'lastSensorData';
const CACHE_TIMESTAMP_KEY = 'lastSensorDataTimestamp';

// Get cached data from localStorage
const getCachedData = (): SensorData[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      // Sadece gerçek API verilerini kabul et (mock data değil)
      if (Array.isArray(data) && data.length > 0) {
        // İlk veriyi kontrol et - eğer mock data ise cache'i temizle
        const firstData = data[0];
        if (firstData && typeof firstData.temperature === 'number' && typeof firstData.humidity === 'number') {
          console.log('✅ Cache\'den gerçek API verileri alındı:', data.length, 'kayıt');
          return data;
        } else {
          console.log('❌ Cache\'de mock data bulundu, temizleniyor...');
          localStorage.removeItem(CACHE_KEY);
          return null;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Cache okuma hatası:', error);
    return null;
  }
};

// Save data to localStorage
const setCachedData = (data: SensorData[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Ignore localStorage errors
  }
};

// Debug: localStorage'daki veriyi kontrol et
export const debugCachedData = (): void => {
  console.log('🔍 DEBUG: localStorage kontrol ediliyor...');
  const cached = getCachedData();
  if (cached) {
    console.log('📊 Cache\'deki veri sayısı:', cached.length);
    console.log('📊 İlk 3 veri:', cached.slice(0, 3));
    console.log('📊 Son 3 veri:', cached.slice(-3));
    
    // Tarih aralığını kontrol et
    if (cached.length > 0) {
      const firstDate = new Date(cached[0].measurement_time || cached[0].measurementTime);
      const lastDate = new Date(cached[cached.length - 1].measurement_time || cached[cached.length - 1].measurementTime);
      console.log('📅 İlk veri tarihi:', firstDate.toLocaleString('tr-TR'));
      console.log('📅 Son veri tarihi:', lastDate.toLocaleString('tr-TR'));
    }
  } else {
    console.log('❌ Cache\'de veri bulunamadı!');
  }
};

// 2. SENSOR DATA URL - JWT ile sensör verilerini çek
export const fetchSensorData = async (): Promise<SensorData[]> => {
  try {
    console.log('🔍 Sensor Data API çağrısı başlatılıyor...');
    console.log('🌐 Backend URL:', BACKEND_BASE_URL);
    console.log('📋 Auth headers:', getAuthHeaders());
    
    // Farklı endpoint'leri test et
    const possibleEndpoints = [
      '/api/evant/getAll'
    ];
    
    let response;
    let successfulUrl = '';
    
    for (const endpoint of possibleEndpoints) {
      const url = `${BACKEND_BASE_URL}${endpoint}`;
      console.log(`🔗 Test URL: ${url}`);
      
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        
        console.log(`📊 ${endpoint} yanıt durumu:`, response.status);
        console.log(`📋 Response headers:`, response.headers);
        
        if (response.ok) {
          successfulUrl = url;
          console.log(`✅ Başarılı endpoint bulundu: ${endpoint}`);
          console.log(`🌐 Kullanılan URL: ${url}`);
          break;
        } else {
          console.log(`❌ ${endpoint} başarısız: ${response.status}`);
          if (response.status === 404) {
            console.log(`❌ 404 - Endpoint bulunamadı: ${endpoint}`);
          } else if (response.status === 401) {
            console.log(`❌ 401 - Yetkilendirme hatası: ${endpoint}`);
          } else if (response.status === 403) {
            console.log(`❌ 403 - Erişim reddedildi: ${endpoint}`);
          } else if (response.status === 500) {
            console.log(`❌ 500 - Sunucu hatası: ${endpoint}`);
          }
          
          // Response body'yi oku
          try {
            const errorText = await response.text();
            console.log(`❌ Error response:`, errorText);
          } catch (e) {
            console.log(`❌ Error response okunamadı:`, e);
          }
        }
      } catch (error) {
        console.log(`❌ ${endpoint} network hatası:`, error);
      }
    }
    
    if (!response || !response.ok) {
      console.error('❌ Hiçbir endpoint çalışmadı');
      // Cache'den veri al (sadece gerçek API verileri)
      const cachedData = getCachedData();
      if (cachedData && cachedData.length > 0) {
        console.log('🔄 Cache\'den gerçek API verileri kullanılıyor:', cachedData.length, 'kayıt');
        return cachedData;
      }
      
      // Cache'de de veri yoksa boş array döndür
      console.log('❌ Cache\'de gerçek API verisi bulunamadı');
      return [];
    }
    
    console.log('📊 API yanıt durumu:', response.status);
    console.log('📋 API response headers:', response.headers);
    console.log('🌐 Başarılı endpoint:', successfulUrl);
    
    const rawData = await response.json();
    console.log('📦 Ham API verisi:', rawData.slice(0, 2));
    console.log('📊 Toplam veri sayısı:', rawData.length);
    console.log('📋 Veri formatı kontrolü:');
    
    if (rawData.length > 0) {
      console.log('📋 İlk veri örneği:', rawData[0]);
      console.log('📋 Son veri örneği:', rawData[rawData.length - 1]);
      
      // Veri yapısını detaylı kontrol et
      const sampleData = rawData[0];
      console.log('📊 Veri yapısı detayı:', {
        id: sampleData.id,
        temperature: sampleData.temperature,
        humidity: sampleData.humidity,
        measurementTime: sampleData.measurementTime,
        measurement_time: sampleData.measurement_time,
        sensorId: sampleData.sensorId,
        timestamp: sampleData.timestamp,
        created_at: sampleData.created_at,
        updated_at: sampleData.updated_at,
        // Backend'den gelen diğer alanlar
        temp: sampleData.temp,
        hum: sampleData.hum,
        sensor_id: sampleData.sensor_id
      });
      
      // Backend formatını tespit et
      console.log('🔍 Backend format analizi:');
      console.log('  - temperature alanı var mı:', 'temperature' in sampleData);
      console.log('  - temp alanı var mı:', 'temp' in sampleData);
      console.log('  - humidity alanı var mı:', 'humidity' in sampleData);
      console.log('  - hum alanı var mı:', 'hum' in sampleData);
      console.log('  - measurementTime alanı var mı:', 'measurementTime' in sampleData);
      console.log('  - measurement_time alanı var mı:', 'measurement_time' in sampleData);
      console.log('  - created_at alanı var mı:', 'created_at' in sampleData);
      console.log('  - sensorId alanı var mı:', 'sensorId' in sampleData);
      console.log('  - sensor_id alanı var mı:', 'sensor_id' in sampleData);
    }
    
    // Veri formatını backend formatına göre düzelt
    const data = rawData.map((item: any) => {
      // Backend'den gelen farklı alan isimlerini kontrol et
      const temperature = item.temperature || item.temp || item.temperature_value || item.temp_value;
      const humidity = item.humidity || item.hum || item.humidity_value || item.hum_value;
      const measurementTime = item.measurementTime || item.measurement_time || item.created_at || item.timestamp || item.time || item.date;
      const sensorId = item.sensorId || item.sensor_id || item.sensorId || item.id;
      
      // Sayı formatını düzelt (virgülü noktaya çevir)
      const processedTemperature = typeof temperature === 'string' 
        ? parseFloat(temperature.replace(',', '.'))
        : temperature;
      
      const processedHumidity = typeof humidity === 'string'
        ? parseFloat(humidity.replace(',', '.'))
        : humidity;
      
      // Geçersiz değerleri kontrol et
      if (processedTemperature === null || processedTemperature === undefined || isNaN(processedTemperature)) {
        console.warn('⚠️ Geçersiz sıcaklık değeri:', temperature);
        return null;
      }
      
      if (processedHumidity === null || processedHumidity === undefined || isNaN(processedHumidity)) {
        console.warn('⚠️ Geçersiz nem değeri:', humidity);
        return null;
      }
      
      return {
        id: item.id || Date.now() + Math.random(),
        temperature: processedTemperature,
        humidity: processedHumidity,
        measurementTime: measurementTime,
        measurement_time: measurementTime,
        sensorId: sensorId || 101
      };
    }).filter((item: SensorData | null) => item !== null); // Geçersiz verileri filtrele
    
    console.log('✅ İşlenmiş veri:', data.slice(0, 2));
    console.log('📊 İşlenmiş toplam veri sayısı:', data.length);
    
    // Bugün için işlenmiş veri sayısını kontrol et
    if (data.length > 0) {
      const today = new Date();
      const todayProcessedData = data.filter((item: any) => {
        const measurementTime = new Date(item.measurement_time || item.measurementTime);
        return measurementTime.getFullYear() === today.getFullYear() &&
               measurementTime.getMonth() === today.getMonth() &&
               measurementTime.getDate() === today.getDate();
      });
      console.log('📊 Bugün için işlenmiş veri sayısı:', todayProcessedData.length);
      
      // Eğer bugün veri yoksa, sadece log ver
      if (todayProcessedData.length === 0) {
        console.log('⚠️ Bugün için veri bulunamadı');
      }
    }
    
    // Sadece veri gerçekten doluysa ve API'den geldiyse cache et
    if (Array.isArray(data) && data.length > 0 && response && response.ok) {
      setCachedData(data);
      console.log('✅ Gerçek API verileri cache\'e kaydedildi');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Sensor Data API Hatası:', error);
    // Return cached data if API fails
    const cachedData = getCachedData();
    if (cachedData && cachedData.length > 0) {
      console.log('🔄 API başarısız, önbellekten veri kullanılıyor:', cachedData.slice(0, 2));
      return cachedData;
    }
    throw error;
  }
};

// 3. ADMIN PANEL API'leri - JWT ile admin işlemleri

// Kullanıcıları listele
export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    console.log('👥 Admin: Kullanıcıları getiriliyor...');
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    console.log('📊 Admin Users API yanıt:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Admin yetkisi gerekli. Lütfen tekrar giriş yapın.');
      }
      const errorText = await response.text();
      throw new Error(`Kullanıcı listesi hatası: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Admin Users başarılı:', data.length, 'kullanıcı');
    return data;
  } catch (error) {
    console.error('❌ Admin Users API Hatası:', error);
    throw error;
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (userData: CreateUserRequest): Promise<AdminUser> => {
  try {
    console.log('➕ Admin: Yeni kullanıcı oluşturuluyor...', userData);
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    console.log('📊 Create User API yanıt:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kullanıcı oluşturma hatası: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Kullanıcı oluşturuldu:', data);
    return data;
  } catch (error) {
    console.error('❌ Create User API Hatası:', error);
    throw error;
  }
};

// Kullanıcı güncelle
export const updateUser = async (userData: UpdateUserRequest): Promise<AdminUser> => {
  try {
    console.log('✏️ Admin: Kullanıcı güncelleniyor...', userData);
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${userData.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    console.log('📊 Update User API yanıt:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kullanıcı güncelleme hatası: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Kullanıcı güncellendi:', data);
    return data;
  } catch (error) {
    console.error('❌ Update User API Hatası:', error);
    throw error;
  }
};

// Kullanıcı sil
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    console.log('🗑️ Admin: Kullanıcı siliniyor...', userId);
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    console.log('📊 Delete User API yanıt:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kullanıcı silme hatası: ${response.status} - ${errorText}`);
    }

    console.log('✅ Kullanıcı silindi:', userId);
  } catch (error) {
    console.error('❌ Delete User API Hatası:', error);
    throw error;
  }
};

// Kullanıcı durumunu güncelle (aktif/pasif)
export const updateUserStatus = async (userId: number, status: 'active' | 'inactive' | 'pending'): Promise<AdminUser> => {
  try {
    console.log('🔄 Admin: Kullanıcı durumu güncelleniyor...', { userId, status });
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    console.log('📊 Update Status API yanıt:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Durum güncelleme hatası: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Kullanıcı durumu güncellendi:', data);
    return data;
  } catch (error) {
    console.error('❌ Update Status API Hatası:', error);
    throw error;
  }
};

// Check if data is from cache (last API call failed)
export const isDataFromCache = (): boolean => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!cached || !timestamp) return false;
    
    // If cache is older than 5 minutes, consider it stale
    const cacheAge = Date.now() - parseInt(timestamp);
    return cacheAge > 5 * 60 * 1000; // 5 minutes
  } catch {
    return false;
  }
};

// Get cache timestamp for display
export const getCacheTimestamp = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  } catch {
    return null;
  }
};

export const getLatestSensorData = (data: SensorData[]): { sensor1: SensorData | null, sensor2: SensorData | null } => {
  const sortedData = [...data].sort((a, b) => 
    new Date(b.measurement_time || b.measurementTime).getTime() - 
    new Date(a.measurement_time || a.measurementTime).getTime()
  );

  return {
    sensor1: sortedData[0] || null,
    sensor2: sortedData[1] || null
  };
};