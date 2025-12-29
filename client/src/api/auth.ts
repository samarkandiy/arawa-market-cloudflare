import apiClient from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
  userId: number;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const response = await apiClient.post<AuthToken>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await apiClient.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    localStorage.removeItem('authToken');
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
};
