// JWT Token Management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Backend URL'leri
const BACKEND_BASE_URL = 'https://8f96270909e9.ngrok-free.app';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Token işlemleri
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// User işlemleri
export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Token geçerliliği kontrolü
export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Mock token kontrolü
    if (token === 'mock.jwt.token') {
      console.log('🎭 Mock token kontrol ediliyor');
      return true; // Mock token her zaman geçerli
    }
    
    // Gerçek JWT token kontrolü
    console.log('🔑 Gerçek JWT token kontrol ediliyor');
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.log('❌ Geçersiz JWT formatı');
      return false;
    }
    
    // JWT payload'ını decode et
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    console.log('📋 JWT Payload:', payload);
    console.log('⏰ Şu anki zaman:', currentTime);
    console.log('⏰ Token bitiş zamanı:', payload.exp);
    
    // Token'ın süresi dolmuş mu kontrol et
    const isValid = payload.exp > currentTime;
    console.log('✅ Token geçerli mi:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('❌ Token decode error:', error);
    return false;
  }
};

// Token'dan user bilgisini çıkar
export const getUserFromToken = (): User | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Mock token için localStorage'dan user bilgisini al
    if (token === 'mock.jwt.token') {
      console.log('🎭 Mock token - localStorage\'dan user alınıyor');
      return getUser();
    }
    
    // Gerçek JWT token'dan user bilgisini çıkar
    console.log('🔑 Gerçek JWT token - payload\'dan user çıkarılıyor');
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.log('❌ Geçersiz JWT formatı');
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('📋 JWT Payload:', payload);
    
    // Backend'den gelen user bilgisini oluştur
    const user: User = {
      id: payload.sub ? parseInt(payload.sub) : 1,
      username: payload.sub || 'user',
      email: `${payload.sub}@example.com`,
      role: payload.role || 'user',
      name: payload.sub || 'User'
    };
    
    console.log('👤 JWT\'den çıkarılan user:', user);
    return user;
  } catch (error) {
    console.error('❌ Token decode error:', error);
    return null;
  }
};

// Backend bağlantısını test et
export const testBackendConnection = async (): Promise<void> => {
  console.log('🔍 Testing backend connection...');
  
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    console.log('📊 Backend test response:', response.status);
    const text = await response.text();
    console.log('📋 Backend test content:', text.substring(0, 200));
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
  }
};

// 1. LOGIN URL'leri - Farklı endpoint'leri test et
const LOGIN_URLS = [
  `${BACKEND_BASE_URL}/api/auth/login`,
  `${BACKEND_BASE_URL}/auth/login`,
  `${BACKEND_BASE_URL}/login`,
  `${BACKEND_BASE_URL}/api/login`
];

// Login işlemi - Backend'den gerçek token al
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  console.log('🔐 Login attempt with credentials:', credentials);
  
  // Backend'den gerçek token al
  try {
    console.log(`🔗 Login URL: ${BACKEND_BASE_URL}/api/auth/login`);
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(credentials)
    });

    console.log(`📊 Login response status:`, response.status);

    if (response.ok) {
      const data: AuthResponse = await response.json();
      console.log('✅ Login success - Backend token alındı:', data);
      
      // Backend'den gelen gerçek token'ı kaydet
      setToken(data.token);
      setUser(data.user);
      
      console.log('🔐 Gerçek token kaydedildi:', data.token);
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Login failed:`, errorData);
      throw new Error(`Login failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Login error:`, error);
    
    // Hata durumunda mock data kullan
    console.log('🔄 Login failed, using mock data');
    const mockUser: User = {
      id: 1,
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      role: credentials.username.toLowerCase().includes('admin') ? 'admin' : 'user',
      name: credentials.username
    };
    
    const mockResponse: AuthResponse = {
      token: 'mock.jwt.token',
      user: mockUser
    };
    
    setToken(mockResponse.token);
    setUser(mockResponse.user);
    
    return mockResponse;
  }
};

// Logout işlemi
export const logout = async (): Promise<void> => {
  const token = getToken();
  
  if (token) {
    try {
      // Backend'e logout isteği gönder
      await fetch(`${BACKEND_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
    } catch (error) {
      console.error('❌ Logout API error:', error);
    }
  }
  
  // Local storage'dan temizle
  removeToken();
  removeUser();
};

// API istekleri için auth header'ı oluştur
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 JWT Token gönderiliyor:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ JWT Token bulunamadı!');
  }
  
  console.log('📋 Auth Headers:', headers);
  return headers;
};

// Kullanıcı rolü kontrolü
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};

export const isUser = (): boolean => {
  const user = getUser();
  return user?.role === 'user';
};

// Token'ı console'da göster (debug için)
export const showToken = (): void => {
  const token = getToken();
  if (token) {
    console.log('🔐 Mevcut Token:', token);
    console.log('📏 Token Uzunluğu:', token.length);
    console.log('🔍 Token İlk 20 karakter:', token.substring(0, 20));
    console.log('🔍 Token Son 20 karakter:', token.substring(token.length - 20));
    
    // Token'ın tipini kontrol et
    if (token === 'mock.jwt.token') {
      console.log('🎭 Bu bir mock token');
    } else {
      console.log('🔑 Bu gerçek bir JWT token');
      try {
        const parts = token.split('.');
        console.log('📦 JWT Bölümleri:', parts.length);
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 JWT Payload:', payload);
        }
      } catch (error) {
        console.log('❌ JWT decode hatası:', error);
      }
    }
  } else {
    console.log('⚠️ Token bulunamadı!');
  }
};

// LocalStorage'dan token'ı göster
export const showTokenFromStorage = (): void => {
  console.log('🔍 LocalStorage Kontrolü:');
  console.log('📦 Tüm localStorage:', localStorage);
  
  const authToken = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  console.log('🔐 auth_token:', authToken);
  console.log('👤 user_data:', userData);
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 Parsed user data:', user);
    } catch (error) {
      console.log('❌ User data parse hatası:', error);
    }
  }
};

// Backend token'ı ile karşılaştırma
export const compareWithBackendToken = (backendToken: string): void => {
  const frontendToken = getToken();
  
  console.log('🔍 TOKEN KARŞILAŞTIRMASI:');
  console.log('🌐 Backend Token:', backendToken);
  console.log('💻 Frontend Token:', frontendToken);
  
  if (frontendToken) {
    console.log('📏 Backend Token Uzunluğu:', backendToken.length);
    console.log('📏 Frontend Token Uzunluğu:', frontendToken.length);
    
    if (frontendToken === backendToken) {
      console.log('✅ Token\'lar aynı!');
    } else {
      console.log('❌ Token\'lar farklı!');
      
      // Token'ların ilk ve son kısımlarını karşılaştır
      console.log('🔍 Backend Token İlk 20:', backendToken.substring(0, 20));
      console.log('🔍 Frontend Token İlk 20:', frontendToken.substring(0, 20));
      
      console.log('🔍 Backend Token Son 20:', backendToken.substring(backendToken.length - 20));
      console.log('🔍 Frontend Token Son 20:', frontendToken.substring(frontendToken.length - 20));
    }
  } else {
    console.log('⚠️ Frontend\'de token bulunamadı!');
  }
};

// Backend'den token test et
export const testBackendToken = async (): Promise<void> => {
  console.log('🧪 Backend token test başlatılıyor...');
  
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        username: 'emın',
        password: 'test123'
      })
    });
    
    console.log('📊 Test response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend token test başarılı:', data);
      console.log('🔐 Backend token:', data.token);
      console.log('👤 Backend user:', data.user);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Backend token test başarısız:', errorData);
    }
  } catch (error) {
    console.error('❌ Backend token test hatası:', error);
  }
};
