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
        accept: 'application/json',
    },
    withCredentials: true
});

axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            return Promise.reject(error);
        }

        // تجاهل طلبات تسجيل الخروج من الاعتراض
        if (originalRequest.url.includes('/users/logout/blacklist/')) {
            return Promise.reject(error);
        }

        const isRefreshRequest = originalRequest.url.includes('/users/token/refresh/');

        if (error.response.status === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true;

            try {
                const response = await axiosInstance.post(
                    '/users/token/refresh/', 
                    {}, 
                    { withCredentials: true }
                );

                if (response.data.access) {
                    // لا حاجة لإضافة الهيدر يدوياً لأننا نستخدم الكوكيز
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                if (!publicPaths.includes(window.location.pathname)) {
                    history.push('/login');
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
