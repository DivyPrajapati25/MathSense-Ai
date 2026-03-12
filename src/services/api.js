import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const authRoutes = [
            "/auth/login/",
            "/auth/signup/",
            "/auth/verify-otp/",
            "/auth/forgot-password/",
            "/auth/resend-otp/",
        ];

        const isAuthRoute = authRoutes.some((route) =>
            error.config.url.includes(route)
        );

        if (error.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;