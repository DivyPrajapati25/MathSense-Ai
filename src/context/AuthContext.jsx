import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const isValidJwt = (token) => {
    try {
        if (!token || typeof token !== "string") return false;
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        if (!payload || typeof payload.exp !== "number") return false;
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

const clearAuth = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem("authToken");
            const savedUser = localStorage.getItem("userData");

            if (savedToken && savedUser && isValidJwt(savedToken)) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch {
                    clearAuth();
                }
            } else {
                clearAuth();
            }
        } catch {
            clearAuth();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const persistAuth = useCallback((accessToken, refreshToken, userData) => {
        localStorage.setItem("authToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
    }, []);

    const signup = async (formData) => {
        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name || null,
            gender: formData.gender,
            role: formData.role,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            standard: formData.role === "STUDENT" ? Number(formData.standard) : null,
        };
        const response = await api.post("/auth/signup/", payload);
        return response.data;
    };

    const login = async (email, password) => {
        const response = await api.post("/auth/login/", { email, password });
        const data = response.data.data;
        const userData = {
            user_id: data.user_id,
            first_name: data.first_name,
            email: data.email,
            role: data.role,
        };
        persistAuth(data.access_token, data.refresh_token, userData);
        if (data.role === "STUDENT") {
            navigate("/student", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
        return response.data;
    };

    const verifyOtp = async (otp, email) => {
        const response = await api.post("/auth/verify-otp/", { otp_code: otp, email });
        const data = response.data.data;
        const userData = {
            user_id: data.user_id,
            first_name: data.first_name,
            email: data.email,
            role: data.role,
        };
        persistAuth(data.access_token, data.refresh_token, userData);
        if (data.role === "TEACHER") {
            navigate("/", { replace: true });
        } else {
            navigate("/student", { replace: true });
        }
        return response.data;
    };

    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        verifyOtp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;