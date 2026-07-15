import axios from "axios";
import { store } from "../store";
import { logout, setCredentials } from "../features/auth/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      // Backend expects raw token, no "Bearer " prefix
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        if (refreshResponse.data.success) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          // We need user data to setCredentials properly, but refresh-token only gives token.
          // In Redux, we can update just the token, or re-fetch user.
          // Since the user is already in state, we can keep it.
          const user = store.getState().auth.user;
          if (user) {
            store.dispatch(setCredentials({ token: newAccessToken, user }));
          }
          
          originalRequest.headers.Authorization = newAccessToken;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear session and log out
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
