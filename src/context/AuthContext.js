import { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../Axios";
import { useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    authenticated: false,
    user: null,
    loading: true,
    error: null
  });
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await axiosInstance.get("/users/check-auth/");
      
      setAuthState({
        authenticated: response.data.authenticated,
        user: response.data.user || null,
        loading: false,
        error: null
      });
      
      return response.data.authenticated;
    } catch (error) {
      console.error("Authentication check failed:", error);
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
        error: error.response?.data?.error || "Failed to authenticate"
      });
      return false;
    }
  }, []);

  useEffect(() => {
    // لا تتحقق من المصادقة إذا كنا في صفحة عامة
    if (publicPaths.includes(location.pathname)) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    checkAuth();
  }, [location.pathname, checkAuth]);

  const logout = async () => {
    try {
      await axiosInstance.post("/users/logout/");
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
        error: null
      });
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthState(prev => ({ ...prev, error: "Failed to logout" }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};