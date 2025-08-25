import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as loginApi, 
  logout as logoutApi, 
  getUser, 
  setUser, 
  removeUser, 
  isTokenValid, 
  getUserFromToken,
  User,
  LoginCredentials,
  AuthResponse
} from '../services/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde token kontrolü yap
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔍 Auth check başlatılıyor...');
        
        // Token var mı kontrol et
        const token = localStorage.getItem('auth_token');
        console.log('🔑 Token var mı:', !!token);
        
        if (token) {
          console.log('✅ Token bulundu');
          const userData = getUser() || getUserFromToken();
          console.log('👤 User data:', userData);
          
          if (userData) {
            setUserState(userData);
            setIsLoggedIn(true);
            console.log('✅ Kullanıcı giriş yapmış olarak ayarlandı');
          } else {
            console.log('❌ User data bulunamadı');
            setUserState(null);
            setIsLoggedIn(false);
          }
        } else {
          console.log('❌ Token yok');
          setUserState(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setUserState(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
        console.log('🏁 Auth check tamamlandı, loading:', false);
      }
    };

    checkAuth();
  }, []);

  // Periyodik token kontrolü (her 5 dakikada bir)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoggedIn && !isTokenValid()) {
        console.log('⏰ Token süresi dolmuş, logout yapılıyor');
        // Token süresi dolmuşsa logout yap
        setUserState(null);
        setIsLoggedIn(false);
      }
    }, 5 * 60 * 1000); // 5 dakika

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setLoading(true);
      console.log('🔐 Login işlemi başlatılıyor...');
      
      const response: AuthResponse = await loginApi(credentials);
      
      setUserState(response.user);
      setIsLoggedIn(true);
      console.log('✅ Login başarılı:', response.user);
      
      return response; // Response'u döndür
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Logout işlemi başlatılıyor...');
      
      await logoutApi();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUserState(null);
      setIsLoggedIn(false);
      setLoading(false);
      console.log('✅ Logout tamamlandı');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 