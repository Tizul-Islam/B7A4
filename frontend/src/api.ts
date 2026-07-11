import axios from 'axios';

let inMemoryToken: string | null = null;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setInMemoryToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getInMemoryToken = () => inMemoryToken;

// Axios instance with base configuration
export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

// Request Interceptor: Attach raw access token to header (no Bearer prefix)
apiInstance.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers['Authorization'] = inMemoryToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized by attempting to refresh token
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only intercept 401 if it's not a retry already
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = token;
            return apiInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/refresh-token`;
        const res = await axios.post(refreshUrl, {}, { withCredentials: true });
        
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          setInMemoryToken(newToken);
          originalRequest.headers['Authorization'] = newToken;
          processQueue(null, newToken);
          return apiInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setInMemoryToken(null);
        // Dispatch event to inform AuthContext of a force-logout
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Format error to match typed ApiError shape
    const apiError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      statusCode: error.response?.status || 500,
      errorDetails: error.response?.data?.errorDetails || null,
    };
    return Promise.reject(apiError);
  }
);

// API Resource Endpoints map
export const api = {
  auth: {
    register: (body: any) => apiInstance.post('/auth/register', body).then(r => r.data),
    login: (body: any) => apiInstance.post('/auth/login', body).then(r => {
      const data = r.data;
      if (data.data?.accessToken) {
        setInMemoryToken(data.data.accessToken);
      }
      return data;
    }),
    refreshToken: () => apiInstance.post('/auth/refresh-token').then(r => {
      const data = r.data;
      if (data.data?.accessToken) {
        setInMemoryToken(data.data.accessToken);
      }
      return data;
    }),
    getMe: () => apiInstance.get('/auth/me').then(r => r.data),
  },

  users: {
    getProfile: () => apiInstance.get('/users/me').then(r => r.data),
    updateProfile: (body: any) => apiInstance.put('/users/me', body).then(r => r.data),
  },

  categories: {
    list: () => apiInstance.get('/categories').then(r => r.data),
    create: (body: any) => apiInstance.post('/admin/categories', body).then(r => r.data),
    update: (id: string, body: any) => apiInstance.patch(`/admin/categories/${id}`, body).then(r => r.data),
    delete: (id: string) => apiInstance.delete(`/admin/categories/${id}`).then(r => r.data),
  },

  gear: {
    list: (params?: any) => apiInstance.get('/gear', { params }).then(r => r.data),
    getById: (id: string) => apiInstance.get(`/gear/${id}`).then(r => r.data),
    getReviews: (id: string) => apiInstance.get(`/gear/${id}/reviews`).then(r => r.data),
    
    // Provider specific
    providerCreate: (body: any) => apiInstance.post('/provider/gear', body).then(r => r.data),
    providerUpdate: (id: string, body: any) => apiInstance.put(`/provider/gear/${id}`, body).then(r => r.data),
    providerDelete: (id: string) => apiInstance.delete(`/provider/gear/${id}`).then(r => r.data),
  },

  rentals: {
    create: (body: any) => apiInstance.post('/rentals', body).then(r => r.data),
    list: () => apiInstance.get('/rentals').then(r => r.data),
    getById: (id: string) => apiInstance.get(`/rentals/${id}`).then(r => r.data),
    cancel: (id: string) => apiInstance.patch(`/rentals/${id}/cancel`).then(r => r.data),
    
    // Provider specific
    providerList: () => apiInstance.get('/provider/orders').then(r => r.data),
    providerUpdateStatus: (id: string, status: string) => 
      apiInstance.patch(`/provider/orders/${id}`, { status }).then(r => r.data),
  },

  payments: {
    create: (rentalOrderId: string) => apiInstance.post('/payments/create', { rentalOrderId }).then(r => r.data),
    verify: (sessionId: string) => apiInstance.post('/payments/verify', { sessionId }).then(r => r.data),
    list: () => apiInstance.get('/payments').then(r => r.data),
    getById: (id: string) => apiInstance.get(`/payments/${id}`).then(r => r.data),
  },

  reviews: {
    create: (body: any) => apiInstance.post('/reviews', body).then(r => r.data),
  },

  admin: {
    users: () => apiInstance.get('/admin/users').then(r => r.data),
    updateUserStatus: (id: string, activeStatus: 'ACTIVE' | 'SUSPENDED') => 
      apiInstance.patch(`/admin/users/${id}`, { activeStatus }).then(r => r.data),
    stats: () => apiInstance.get('/admin/stats').then(r => r.data),
    rentals: () => apiInstance.get('/admin/rentals').then(r => r.data),
    gear: () => apiInstance.get('/admin/gear').then(r => r.data),
  }
};
