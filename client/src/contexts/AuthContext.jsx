import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/authService';

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
