import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Sun, Moon } from "lucide-react";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const loginSchema = yup.object().shape({
    email: yup.string().transform((value) => value?.trim()).email("Please enter a valid email address").required("Email is required"),
    password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

const LoginPage = () => {
    const { login } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState(
        location.state?.passwordReset ? "Password changed successfully! Please login with your new password." : ""
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        if (apiError) setApiError("");
        if (successMessage) setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        const trimmedFormData = { ...formData, email: formData.email.trim() };
        try {
            await loginSchema.validate(trimmedFormData, { abortEarly: false });
            setErrors({});
        } catch (validationError) {
            const fieldErrors = {};
            validationError.inner.forEach((err) => { fieldErrors[err.path] = err.message; });
            setErrors(fieldErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            await login(trimmedFormData.email, formData.password);
        } catch (err) {
            if (!err.response) { setApiError("Network error. Please check your internet connection."); return; }
            const status = err.response?.status;
            const data = err.response?.data;
            const detail = data?.detail;
            const message = data?.message || data?.error;
            if (status === 401 || status === 403) setApiError("Invalid email or password.");
            else if (status === 500) setApiError("Something went wrong on our end. Please try again later.");
            else if (status === 422) {
                if (Array.isArray(detail)) setApiError(detail.map((d) => d.msg || d.message || d).join(", "));
                else setApiError(detail || message || "Invalid data. Please check your inputs.");
            } else if (Array.isArray(detail)) setApiError(detail.map((d) => d.msg || d.message || d).join(", "));
            else if (typeof detail === "string") setApiError(detail);
            else if (message) setApiError(message);
            else setApiError("Login failed. Please try again.");
        } finally { setIsSubmitting(false); }
    };

    const inputCls = (field) => `w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
        errors[field] ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)] text-[var(--color-text-primary)]"
    }`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4 py-12 transition-colors duration-300">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-green-500 shadow-lg mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Welcome Back</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">Sign in to your MathSense AI account</p>
                </div>

                <div className="bg-[var(--color-bg-card)] backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--color-border)] p-8">
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{apiError}</span>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{successMessage}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                <input autoComplete="email" id="login-email" type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="you@example.com" className={inputCls("email")} />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                <input autoComplete="current-password" id="login-password" type={showPassword ? "text" : "password"} name="password"
                                    value={formData.password} onChange={handleChange} placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.password ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)] text-[var(--color-text-primary)]"}`} />
                                <button type="button" onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors p-1" tabIndex={-1}>
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
                        </div>

                        <div className="flex justify-end -mt-2">
                            <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
                        Don&apos;t have an account?{" "}
                        <Link to="/signup" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;