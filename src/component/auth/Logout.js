import { useEffect, useState } from "react";
import axiosInstance from "../../Axios";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                // 1. إرسال طلب تسجيل الخروج
                await axiosInstance.post("/users/logout/blacklist/", {}, {
                    withCredentials: true
                });

                // 2. حذف الكوكيز محلياً
                const cookieSettings = [
                    'path=/',
                    'domain=yourdomain.com', // استبدل بنطاقك الفعلي
                    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
                    'samesite=None',
                    'secure'
                ].join('; ');

                document.cookie = `access_token=; ${cookieSettings}`;
                document.cookie = `refresh_token=; ${cookieSettings}`;

                // 3. إعادة تعيين axios instance
                delete axiosInstance.defaults.headers.common['Authorization'];

                // 4. التوجيه إلى صفحة تسجيل الدخول
                navigate("/login", { replace: true });

            } catch (error) {
                console.error("Logout error:", error);
                setError("Failed to logout. Please try again.");
                
                // الاستمرار في عملية التنظيف حتى لو فشل الطلب
                const cookieSettings = [
                    'path=/',
                    'domain=yourdomain.com',
                    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
                    'samesite=None',
                    'secure'
                ].join('; ');

                document.cookie = `access_token=; ${cookieSettings}`;
                document.cookie = `refresh_token=; ${cookieSettings}`;
                
                navigate("/login", { replace: true });
            }
        };

        logoutUser();
    }, [navigate]);

    return (
        <div className="logout-container">
            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="logout-message">Logging out...</div>
            )}
        </div>
    );
};