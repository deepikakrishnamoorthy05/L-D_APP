import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthUser, LoginCredentials } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; errorMessage?: string; statusMessage?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize isAuthenticated to false on app load so the login page opens first when visiting the site
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('ld_platform_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    if (result.success && result.user) {
      if (credentials.rememberMe) {
        localStorage.setItem('ld_platform_remember_email', credentials.email);
      } else {
        localStorage.removeItem('ld_platform_remember_email');
      }
      localStorage.setItem('ld_platform_user', JSON.stringify(result.user));
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem('ld_platform_authenticated');
    localStorage.removeItem('ld_platform_user');
    setIsAuthenticated(false);
    setUser(null);
    if (window.location.pathname !== '/login') {
      window.history.replaceState(null, '', '/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
