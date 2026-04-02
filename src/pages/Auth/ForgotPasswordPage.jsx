import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, AlertCircle, KeyRound, CheckCircle, Sun, Moon } from "lucide-react";
import * as yup from "yup";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const forgotSchema = yup.object().shape({
    email: yup.string().email("Please enter a valid email address").required("Email is required"),
});

const ForgotPasswordPage = () => {
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(""); setError("");
        try { await forgotSchema.validate({ email }); } catch (ve) { setError(ve.message); return; }
        setIsSubmitting(true);
        try {
            await api.post("/auth/forgot-password/", { email });
            setSuccess(true);
            setTimeout(() => navigate("/verify-otp", { state: { email, isPasswordReset: true } }), 2000);
        } catch (err) {
            const data = err.response?.data;
            setApiError(typeof data?.detail === "string" ? data.detail : data?.message || "Something went wrong.");
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4 py-12 transition-colors duration-300">
            <button onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-green-500 shadow-lg mb-4">
                        <KeyRound className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Forgot Password</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">Enter your email and we'll send you an OTP to reset your password</p>
                </div>

                <div className="bg-[var(--color-bg-card)] backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--color-border)] p-8">
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{apiError}</span>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>OTP sent! Redirecting to verification...</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                <input id="forgot-email" type="email" name="email" value={email} autoComplete="email"
                                    onChange={(e) => { setEmail(e.target.value); setError(""); setApiError(""); }}
                                    placeholder="you@example.com"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-[var(--color-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                                        error ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)]"
                                    }`} />
                            </div>
                            {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting || success}
                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending OTP…</span> : "Send OTP"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
                        Remember your password?{" "}
                        <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Back to Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;