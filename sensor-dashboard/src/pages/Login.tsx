import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../services/auth';
import '../styles/login.css';

const Login: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sayfa yüklendiğinde animasyon başlat
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login(credentials);
      
      // Kullanıcının rolüne göre yönlendirme yap
      if (response.user.role === 'admin') {
        navigate('/admin'); // Admin kullanıcıları admin paneline yönlendir
      } else {
        navigate('/'); // Normal kullanıcıları ana sayfaya yönlendir
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Giriş başarısız!');
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="login-split-bg">
      <div className={`login-split-container ${isAnimating ? 'animate-in' : ''}`}>
        <div className="login-split-left">
          <div className="brand-section">
            <img src="/netfour.png" alt="Login Illustration" className="login-illustration" />
            <div className="brand-text">
              <h1 className="brand-title">NETFOUR</h1>
            </div>
          </div>
        </div>
        <div className="login-split-right">
          <div className="login-form-box">
            <div className="welcome-text">
              <h2 className="login-title">Hoş Geldiniz</h2>
              <p className="login-subtitle">Hesabınıza giriş yapın</p>
            </div>
            
            {error && (
              <div className="alert alert-danger animate-shake" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <i className="bi bi-person me-2"></i>
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  required
                  autoComplete="username"
                  disabled={loading}
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="bi bi-lock me-2"></i>
                  Şifre
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    value={credentials.password}
                    onChange={handleInputChange('password')}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    placeholder="Şifrenizi girin"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    disabled={loading}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="form-options">
                <div className="form-check">
                  <input type="checkbox" id="remember" className="form-check-input" />
                  <label htmlFor="remember" className="form-check-label">Beni Hatırla</label>
                </div>
                <Link to="/forgot" className="forgot-link">Şifremi unuttum?</Link>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Giriş Yap
                  </>
                )}
              </button>
              
              <div className="register-section">
                <div className="divider">
                  <span>veya</span>
                </div>
                <p className="register-text">
                  Hesabınız yok mu? 
                  <Link to="/register" className="register-link">Kayıt olun</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;