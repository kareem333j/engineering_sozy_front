import { useEffect, useState } from "react";
import axiosInstance from "../../Axios";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                // 1. إرسال طلب تسجيل الخروج للباك-إند
                await axiosInstance.post("/users/logout/blacklist/", {});

                // 2. حذف الكوكيز محلياً
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=None; secure";
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=None; secure";

                // 3. إعادة التوجيه بعد التأكد من نجاح العملية
                navigate("/login", { replace: true });

            } catch (error) {
                console.error("Logout error:", error);
                setError("Failed to logout. Please try again.");
                
                // محاولة حذف الكوكيز محلياً حتى لو فشل الطلب
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=None; secure";
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=None; secure";
                
                navigate("/login", { replace: true });
            }
        };

        logoutUser();
    }, [navigate]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return <div className="logout-message">Logging out...</div>;
};