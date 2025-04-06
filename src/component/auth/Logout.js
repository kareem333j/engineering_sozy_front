import { useEffect, useState } from "react";
import axiosInstance from "../../Axios";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                // تسجيل الخروج الفعلي و blacklisting للـ refresh token
                await axiosInstance.post("/users/logout/blacklist/", {}, {
                    withCredentials: true
                });

                // حذف الكوكيز
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=None";
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=None";

                // مسح الـ Authorization header
                delete axiosInstance.defaults.headers.common["Authorization"];

                // إعادة التوجيه
                navigate("/login", { replace: true });

            } catch (err) {
                console.error("Logout error:", err);
                setError("فشل في تسجيل الخروج. حاول مرة أخرى.");

                // تنظيف احتياطي
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=None";
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=None";
                delete axiosInstance.defaults.headers.common["Authorization"];

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
                <div className="logout-message">جاري تسجيل الخروج...</div>
            )}
        </div>
    );
};
