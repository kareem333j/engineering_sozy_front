import { useEffect } from "react";
import axiosInstance from "../../Axios";

export const Logout = () => {
    useEffect(() => {
        const action = async () => {
            try {
                await axiosInstance.post("/users/logout/blacklist/", {});
                // await axiosInstance.post("/users/blacklist/", {
                //     refresh_token: getCookie("refresh_token"),
                // });

                window.location.href = "/login";
            } catch (error) {
                console.error("Logout error:", error);
            }
        };

        action();
    }, []);

    return <>logout...</>;
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}
