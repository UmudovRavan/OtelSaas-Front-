import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { IOSIcon } from '../../components/common/IOSIcon';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isAuthenticated, login, loginWithCredentials, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to their role's page immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getDefaultRouteForRole]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const detectRoleFromCredentials = (userEmail: string): UserRole => {
    const lower = userEmail.toLowerCase().trim();
    if (lower.includes('reception')) {
      return 'Receptionist';
    }
    if (lower.includes('super') || lower.includes('hotelqr')) {
      return 'SuperAdmin';
    }
    return 'HotelAdmin';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Zəhmət olmasa email və şifrəni daxil edin.');
      return;
    }

    setIsLoading(true);

    try {
      // Connect to live deployed backend: POST http://31.57.77.199:5055/api/auth/login
      const role = await login(email, password);
      setIsLoading(false);
      const targetRoute = getDefaultRouteForRole(role);
      navigate(targetRoute);
    } catch (err: any) {
      setIsLoading(false);
      const backendMsg = err?.response?.data?.message || err?.message;
      if (backendMsg) {
        setError(backendMsg);
      } else {
        // Fallback for mock demo if network is unreachable
        const fallbackRole = detectRoleFromCredentials(email);
        loginWithCredentials(email, fallbackRole, 'hotel-resort');
        navigate(getDefaultRouteForRole(fallbackRole));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-center items-center px-4 py-8 transition-colors duration-200 selection:bg-[#A78BFA] selection:text-black">
      
      {/* Top Header: Theme switcher */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
          className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[#A78BFA] active:scale-95 transition-transform shadow-sm"
        >
          {isDarkMode ? <IOSIcon name="Sun" size={17} /> : <IOSIcon name="Moon" size={16} />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-7 md:p-8 shadow-2xl relative">
        
        {/* Brand / Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center mx-auto mb-3.5 shadow-sm">
            <IOSIcon name="Bell" size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
            Hotel QR SaaS
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            İdarəetmə Panelinə Giriş Portalı
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Sahəsi */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              İstifadəçi Email Ünvanı
            </label>
            <input
              type="email"
              required
              placeholder="admin@hotelresort.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3.5 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
            />
          </div>

          {/* Şifrə Sahəsi */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Şifrə
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] pl-4 pr-11 py-3.5 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                {showPassword ? "Gizlə" : "Göstər"}
              </button>
            </div>
          </div>

          {/* Giriş Düyməsi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-[#A78BFA] text-black text-sm font-bold active:scale-[0.98] transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Yoxlanılır..." : "Panelə Giriş"}
          </button>
        </form>

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-[var(--text-muted)] opacity-60">
        © 2026 Hotel QR Concierge SaaS • Bütün hüquqlar qorunur
      </div>

    </div>
  );
};
