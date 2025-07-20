import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configuration d'axios pour inclure le token dans les requêtes
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: string;
  };
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  }

  async updateProfile(userData: Partial<RegisterData>) {
    const response = await axios.put(`${API_URL}/auth/profile`, userData);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await axios.put(`${API_URL}/auth/password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async requestPasswordReset(email: string) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
    return response.data;
  }

  async resendVerificationEmail() {
    const response = await axios.post(`${API_URL}/auth/resend-verification`);
    return response.data;
  }
}

export default new AuthService(); 