import apiClient from './api';

export const authService = {
  register: async (data) => {
    const response = await apiClient.post('/api/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Store user info from response
      const user = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        displayName: response.data.displayName,
        role: response.data.role,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post('/api/auth/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Store user info from response
      const user = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        displayName: response.data.displayName,
        role: response.data.role,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};
