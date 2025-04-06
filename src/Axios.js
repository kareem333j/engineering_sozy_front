import axios from 'axios';
import { createBrowserHistory } from 'history';

export const baseURL = "https://engineeringsozy.vercel.app";
const history = createBrowserHistory();
const publicPaths = ["/", "/login", "/register"];

const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor
// axiosInstance.interceptors.request.use(
//     (config) => {
//         return config;
//     },
//     (error) => {
//         console.error('Request error:', error);
//         return Promise.reject(error);
//     }
// );

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
      const publicPaths = ["/", "/login", "/register"];
      const path = new URL(config.baseURL + config.url).pathname;
  
      if (publicPaths.includes(path)) {
        config.withCredentials = false;  
      } else {
        config.withCredentials = true;
      }
  
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );
  

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (!error.response || originalRequest.url.includes('/users/token/refresh/')) {
            return Promise.reject(error);
        }

        // حالة 401 Unauthorized
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshResponse = await axiosInstance.post(
                    '/users/token/refresh/', 
                    {}, 
                    { withCredentials: true }
                );
                
                if (refreshResponse.status === 200) {
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Refresh token error:', refreshError);
                
                if (!publicPaths.includes(window.location.pathname)) {
                    window.location.href = '/login?session_expired=true';
                }
                return Promise.reject(refreshError);
            }
        }

        // معالجة أخطاء أخرى
        if (error.response.status === 403) {
            console.error('Forbidden access:', error);
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = '/login?unauthorized=true';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;