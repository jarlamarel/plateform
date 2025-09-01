import axios from 'axios';

// Configuration des URLs des services déployés sur Vercel
const API_BASE_URLS = {
  auth: process.env.REACT_APP_AUTH_API_URL || 'https://your-auth-service.vercel.app/api',
  content: process.env.REACT_APP_CONTENT_API_URL || 'https://your-content-service.vercel.app/api',
  payment: process.env.REACT_APP_PAYMENT_API_URL || 'https://your-payment-service.vercel.app/api',
  notification: process.env.REACT_APP_NOTIFICATION_API_URL || 'https://your-notification-service.vercel.app/api',
  database: process.env.REACT_APP_DATABASE_API_URL || 'https://your-database-service.vercel.app/api',
  metrics: process.env.REACT_APP_METRICS_API_URL || 'https://your-metrics-service.vercel.app/api'
};

// Configuration axios commune
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour ajouter le token d'authentification
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Instances API pour chaque service
export const authApi = createApiInstance(API_BASE_URLS.auth);
export const contentApi = createApiInstance(API_BASE_URLS.content);
export const paymentApi = createApiInstance(API_BASE_URLS.payment);
export const notificationApi = createApiInstance(API_BASE_URLS.notification);
export const databaseApi = createApiInstance(API_BASE_URLS.database);
export const metricsApi = createApiInstance(API_BASE_URLS.metrics);

// Fonctions d'API pour l'authentification
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    authApi.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; name: string }) =>
    authApi.post('/auth/register', userData),
  
  logout: () => authApi.post('/auth/logout'),
  
  refreshToken: () => authApi.post('/auth/refresh'),
  
  forgotPassword: (email: string) =>
    authApi.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    authApi.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    authApi.post('/auth/verify-email', { token }),
  
  // OAuth
  googleAuth: () => authApi.get('/auth/google'),
  facebookAuth: () => authApi.get('/auth/facebook'),
  githubAuth: () => authApi.get('/auth/github'),
};

// Fonctions d'API pour le contenu
export const contentService = {
  getCourses: (params?: any) => contentApi.get('/courses', { params }),
  
  getCourse: (id: string) => contentApi.get(`/courses/${id}`),
  
  createCourse: (courseData: any) => contentApi.post('/courses', courseData),
  
  updateCourse: (id: string, courseData: any) =>
    contentApi.put(`/courses/${id}`, courseData),
  
  deleteCourse: (id: string) => contentApi.delete(`/courses/${id}`),
  
  // Leçons
  getLessons: (courseId: string) => contentApi.get(`/courses/${courseId}/lessons`),
  
  getLesson: (courseId: string, lessonId: string) =>
    contentApi.get(`/courses/${courseId}/lessons/${lessonId}`),
  
  createLesson: (courseId: string, lessonData: any) =>
    contentApi.post(`/courses/${courseId}/lessons`, lessonData),
  
  updateLesson: (courseId: string, lessonId: string, lessonData: any) =>
    contentApi.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData),
  
  deleteLesson: (courseId: string, lessonId: string) =>
    contentApi.delete(`/courses/${courseId}/lessons/${lessonId}`),
  
  // Upload
  uploadVideo: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('video', file);
    
    return contentApi.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return contentApi.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Fonctions d'API pour les paiements
export const paymentService = {
  createPaymentIntent: (amount: number, currency: string = 'eur') =>
    paymentApi.post('/payments/intent', { amount, currency }),
  
  confirmPayment: (paymentIntentId: string) =>
    paymentApi.post(`/payments/confirm/${paymentIntentId}`),
  
  getPaymentHistory: () => paymentApi.get('/payments/history'),
  
  createSubscription: (planId: string) =>
    paymentApi.post('/subscriptions', { planId }),
  
  cancelSubscription: (subscriptionId: string) =>
    paymentApi.delete(`/subscriptions/${subscriptionId}`),
  
  getInvoices: () => paymentApi.get('/invoices'),
};

// Fonctions d'API pour les notifications
export const notificationService = {
  subscribe: (subscription: PushSubscription) =>
    notificationApi.post('/notifications/subscribe', subscription),
  
  unsubscribe: () => notificationApi.delete('/notifications/unsubscribe'),
  
  getNotifications: () => notificationApi.get('/notifications'),
  
  markAsRead: (notificationId: string) =>
    notificationApi.put(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () => notificationApi.put('/notifications/read-all'),
  
  deleteNotification: (notificationId: string) =>
    notificationApi.delete(`/notifications/${notificationId}`),
};

// Fonctions d'API pour la base de données
export const databaseService = {
  getUserProfile: () => databaseApi.get('/users/profile'),
  
  updateUserProfile: (profileData: any) =>
    databaseApi.put('/users/profile', profileData),
  
  getUserCourses: () => databaseApi.get('/users/courses'),
  
  enrollInCourse: (courseId: string) =>
    databaseApi.post(`/enrollments`, { courseId }),
  
  getEnrollmentStatus: (courseId: string) =>
    databaseApi.get(`/enrollments/${courseId}`),
  
  updateProgress: (courseId: string, lessonId: string, progress: number) =>
    databaseApi.put(`/enrollments/${courseId}/progress`, { lessonId, progress }),
};

// Fonctions d'API pour les métriques
export const metricsService = {
  getCourseMetrics: (courseId: string) =>
    metricsApi.get(`/metrics/courses/${courseId}`),
  
  getUserMetrics: () => metricsApi.get('/metrics/user'),
  
  getAnalytics: (params?: any) => metricsApi.get('/analytics', { params }),
  
  getDashboard: () => metricsApi.get('/dashboard'),
  
  generateReport: (type: string, params?: any) =>
    metricsApi.post('/reports', { type, params }),
};

export default {
  auth: authService,
  content: contentService,
  payment: paymentService,
  notification: notificationService,
  database: databaseService,
  metrics: metricsService,
};
