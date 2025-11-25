import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/authService';
import apiClient from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    // Backend returns userId, username, email, displayName, role directly
    const userData = {
      id: response.userId,
      username: response.username,
      email: response.email,
      displayName: response.displayName,
      role: response.role,
    };
    setUser(userData);
    return response;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    // Backend returns userId, username, email, displayName, role directly
    const userData = {
      id: response.userId,
      username: response.username,
      email: response.email,
      displayName: response.displayName,
      role: response.role,
    };
    setUser(userData);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const setTokensFromOAuth = async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    try {
      // Fetch user profile from backend
      const response = await apiClient.get('/api/users/me');
      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        displayName: response.data.displayName,
        role: response.data.role,
        avatarUrl: response.data.avatarUrl,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user after OAuth:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...(patch || {}) };
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update user in localStorage', e);
      }
      return updated;
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    setTokensFromOAuth,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
