import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseJwt, createMockJwt } from '../utils/jwt';
import { authService } from '../services/api/authService';

export type UserRole = 'Receptionist' | 'HotelAdmin' | 'SuperAdmin';

export interface AuthUser {
  email: string;
  role: UserRole;
  fullName?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  loginWithToken: (
    jwtToken: string,
    meta?: {
      fullName?: string;
      tenantId?: string | null;
      tenantSlug?: string | null;
      tenantName?: string | null;
      role?: UserRole;
    }
  ) => void;
  loginWithCredentials: (email: string, role: UserRole, tenantSlug?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getDefaultRouteForRole: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('otelsaas_token');
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = localStorage.getItem('otelsaas_token');
    if (!savedToken) return null;
    try {
      const savedUserRaw = localStorage.getItem('otelsaas_user');
      if (savedUserRaw) {
        const savedUser = JSON.parse(savedUserRaw) as AuthUser;
        if (savedUser && savedUser.email) {
          return { ...savedUser, token: savedToken };
        }
      }
    } catch (e) {
      // ignore parse error
    }
    const decoded = parseJwt(savedToken);
    if (!decoded) return null;
    return {
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
      tenantSlug: decoded.tenantSlug,
      token: savedToken,
    };
  });

  const loginWithToken = (
    jwtToken: string,
    meta?: {
      fullName?: string;
      tenantId?: string | null;
      tenantSlug?: string | null;
      tenantName?: string | null;
      role?: UserRole;
    }
  ) => {
    const decoded = parseJwt(jwtToken);
    if (decoded) {
      const newUser: AuthUser = {
        email: decoded.email,
        role: meta?.role || decoded.role,
        fullName: meta?.fullName || decoded.email,
        tenantId: meta?.tenantId || decoded.tenantId,
        tenantSlug: meta?.tenantSlug || decoded.tenantSlug,
        tenantName: meta?.tenantName || undefined,
        token: jwtToken,
      };
      setToken(jwtToken);
      setUser(newUser);
      localStorage.setItem('otelsaas_token', jwtToken);
      localStorage.setItem('otelsaas_user', JSON.stringify(newUser));
    }
  };

  const login = async (email: string, password: string): Promise<UserRole> => {
    try {
      const data = await authService.login({ email, password });
      const rawRole = (data.roles && data.roles[0]) || 'Receptionist';
      const role: UserRole = rawRole === 'HotelStaff' ? 'Receptionist' : (rawRole as UserRole);

      if (data.refreshToken) {
        localStorage.setItem('otelsaas_refresh_token', data.refreshToken);
      }

      loginWithToken(data.accessToken, {
        fullName: data.fullName,
        tenantId: data.tenantId,
        tenantSlug: data.tenantSlug,
        tenantName: data.tenantName,
        role,
      });
      return role;
    } catch (err: any) {
      console.warn('Real API login error, checking fallback demo:', err);
      throw err;
    }
  };

  const loginWithCredentials = (email: string, role: UserRole, tenantSlug = 'hotel-resort') => {
    // Fallback generator for offline/demo tests
    const jwtToken = createMockJwt(email, role, tenantSlug);
    loginWithToken(jwtToken, { role, tenantSlug });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('otelsaas_token');
    localStorage.removeItem('otelsaas_user');
    localStorage.removeItem('otelsaas_refresh_token');
    localStorage.removeItem('token');
  };

  const getDefaultRouteForRole = (role: UserRole): string => {
    switch (role) {
      case 'SuperAdmin':
        return '/super-admin';
      case 'HotelAdmin':
        return '/admin';
      case 'Receptionist':
      default:
        return '/reception';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithToken,
        loginWithCredentials,
        logout,
        isAuthenticated: !!user,
        getDefaultRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
