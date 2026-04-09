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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

const AUTH_ROUTES = [
    "/auth/login/",
    "/auth/signup/",
    "/auth/verify-otp/",
    "/auth/forgot-password/",
    "/auth/resend-otp/",
    "/auth/refresh-token/",
];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthRoute = AUTH_ROUTES.some((route) =>
            originalRequest.url.includes(route)
        );
        if (error.response?.status !== 401 || isAuthRoute || originalRequest._retry) {
            if (error.response?.status === 401 && !isAuthRoute && originalRequest._retry) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userData");
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/refresh-token/`,
                { refresh_token: refreshToken }
            );

            const newAccessToken = res.data?.data?.access_token;
            const newRefreshToken = res.data?.data?.refresh_token;

            if (newAccessToken) {
                localStorage.setItem("authToken", newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            }

            throw new Error("No access token in refresh response");
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userData");
            window.location.href = "/login";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;