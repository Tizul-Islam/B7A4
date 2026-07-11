import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setInMemoryToken } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone?: string;
  address?: string;
  activeStatus: 'ACTIVE' | 'SUSPENDED';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (payload: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session by refreshing the token and getting user info
  const initSession = async () => {
    try {
      const refreshRes = await api.auth.refreshToken();
      const token = refreshRes.data?.accessToken;
      if (token) {
        setInMemoryToken(token);
        const meRes = await api.auth.getMe();
        setUser(meRes.data);
      }
    } catch (err) {
      console.log('[AuthContext] No active session found.');
      setInMemoryToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession();

    // Listen for force logout events from the Axios interceptor
    const handleForceLogout = () => {
      setInMemoryToken(null);
      setUser(null);
    };

    window.addEventListener('auth_logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth_logout', handleForceLogout);
    };
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await api.auth.login(credentials);
      const token = res.data?.accessToken;
      if (token) {
        setInMemoryToken(token);
      }
      const meRes = await api.auth.getMe();
      setUser(meRes.data);
      return meRes.data;
    } catch (err) {
      setInMemoryToken(null);
      setUser(null);
      throw err;
    }
  };

  const register = async (payload: any) => {
    return api.auth.register(payload);
  };

  const logout = () => {
    setInMemoryToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
