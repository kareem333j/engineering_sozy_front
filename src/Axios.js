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
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        // لو فيه access_token محفوظ في الكوكيز، ممكن نضيفه هنا لو محتاج (اختياري)
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) return Promise.reject(error);

        const isRefreshRequest = originalRequest.url.includes('/users/token/refresh/');

        if (error.response.status === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true;

            try {
                const response = await axiosInstance.post('/users/token/refresh/', {}, {
                    withCredentials: true,
                });

                const access = response?.data?.access;
                if (access) {
                    axiosInstance.defaults.headers['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return axiosInstance(originalRequest);
                } else {
                    // مفيش access جديد
                    if (!publicPaths.includes(window.location.pathname)) {
                        history.push("/login");
                    }
                    return Promise.reject("❌ No access token returned");
                }
            } catch (err) {
                if (!publicPaths.includes(window.location.pathname)) {
                    history.push("/login");
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
