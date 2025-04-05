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

        const isRefreshRequest = originalRequest.url.includes('/users/token/refresh/');

        if (error.response.status === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true; 

            // ✅ التحقق من وجود refresh_token في الكوكيز
            // const refreshToken = document.cookie
            //     .split('; ')
            //     .find(row => row.startsWith('refresh_token='))
            //     ?.split('=')[1];

            // if (!refreshToken) {
            //     console.warn("🚫 لا يوجد refresh_token، التوجيه إلى صفحة تسجيل الدخول.");
            //     history.push('/login');
            //     return Promise.reject("🚫 لا يوجد refresh_token");
            // }
            // console.log("cookie: ",document.cookie);

            try {
                const response = await axiosInstance.post('/users/token/refresh/', {}, { withCredentials: true });

                if (response.data.access) {
                    axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                    return axiosInstance(originalRequest);
                } else {
                    if(!publicPaths.includes(window.location.pathname)){
                        history.push('/login');
                    }
                    return Promise.reject("❌ لم يتم استرجاع access token");
                }
            } catch (err) {
                if(!publicPaths.includes(window.location.pathname)){
                    history.push('/login');
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
