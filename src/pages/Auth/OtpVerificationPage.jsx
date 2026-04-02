import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle, RotateCcw, Mail, Lock, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import * as yup from "yup";

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

const passwordSchema = yup.object().shape({
    new_password: yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
    confirmPassword: yup.string().oneOf([yup.ref("new_password")], "Passwords must match").required("Please confirm your password"),
});

const OtpVerificationPage = () => {
    const { verifyOtp } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";
    const isPasswordReset = location.state?.isPasswordReset || false;

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
    const [canResend, setCanResend] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const inputRefs = useRef([]);

    useEffect(() => { if (!email) navigate(isPasswordReset ? "/forgot-password" : "/signup", { replace: true }); }, [email, navigate, isPasswordReset]);
    useEffect(() => { if (countdown <= 0) { setCanResend(true); return; } const t = setTimeout(() => setCountdown((c) => c - 1), 1000); return () => clearTimeout(t); }, [countdown]);
    useEffect(() => { inputRefs.current[0]?.focus(); }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp); setApiError("");
        if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };
    const handleKeyDown = (index, e) => { if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus(); };
    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newOtp = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setApiError(""); setPasswordErrors({});
        const otpString = otp.join("");
        if (otpString.length < OTP_LENGTH) { setApiError("Please enter the complete 6-digit OTP."); return; }
        if (isPasswordReset) {
            try { await passwordSchema.validate({ new_password: newPassword, confirmPassword }, { abortEarly: false }); }
            catch (ve) { const fe = {}; ve.inner.forEach((err) => { if (!fe[err.path]) fe[err.path] = err.message; }); setPasswordErrors(fe); return; }
        }
        setIsSubmitting(true);
        try {
            if (isPasswordReset) {
                await api.post("/auth/verify-otp/", { otp_code: otpString, email, new_password: newPassword });
                setResetSuccess(true);
                setTimeout(() => navigate("/login", { state: { passwordReset: true }, replace: true }), 2000);
            } else { await verifyOtp(otpString, email); }
        } catch (err) {
            const data = err.response?.data; const detail = data?.detail; const message = data?.message || data?.error;
            if (typeof detail === "string") setApiError(detail);
            else if (Array.isArray(detail)) setApiError(detail.map((d) => d.msg || d.message || d).join(", "));
            else if (message) setApiError(message);
            else setApiError("OTP verification failed. Please try again.");
        } finally { setIsSubmitting(false); }
    };

    const handleResend = async () => {
        if (!canResend || isResending) return;
        setIsResending(true); setApiError(""); setResendSuccess(false);
        try {
            if (isPasswordReset) await api.post("/auth/forgot-password/", { email });
            else await api.post("/auth/resend-otp/", { email });
            setResendSuccess(true); setCanResend(false); setCountdown(RESEND_COUNTDOWN);
            setOtp(Array(OTP_LENGTH).fill("")); inputRefs.current[0]?.focus();
        } catch (err) {
            const data = err.response?.data;
            setApiError(typeof data?.detail === "string" ? data.detail : data?.message || "Failed to resend OTP.");
        } finally { setIsResending(false); }
    };

    const inputCls = (hasError) => `w-full pl-11 pr-12 py-3 rounded-xl border text-sm text-[var(--color-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
        hasError ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)]"
    }`;

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
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {isPasswordReset ? "Reset Password" : "Verify Your Email"}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">
                        {isPasswordReset ? "Enter the OTP sent to your email and set a new password" : "We sent a 6-digit code to"}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{email}</span>
                    </div>
                </div>

                <div className="bg-[var(--color-bg-card)] backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--color-border)] p-8">
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{apiError}</span>
                        </motion.div>
                    )}
                    {resendSuccess && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /><span>OTP resent successfully! Please check your email.</span>
                        </motion.div>
                    )}
                    {resetSuccess && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /><span>Password reset successfully! Redirecting to login...</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3 text-center">Enter verification code</label>
                            <div className="flex justify-center gap-3" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <motion.input key={index} ref={(el) => (inputRefs.current[index] = el)}
                                        type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)} autoComplete="off"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
                                        className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                            ${digit ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"}
                                            ${apiError ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : ""}
                                            hover:border-[var(--color-text-muted)] focus:border-blue-500`} />
                                ))}
                            </div>
                        </div>

                        {isPasswordReset && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">New Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                        <input type={showNewPassword ? "text" : "password"} value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors((p) => ({ ...p, new_password: "" })); }}
                                            placeholder="Min. 8 characters" autoComplete="new-password" className={inputCls(passwordErrors.new_password)} />
                                        <button type="button" onClick={() => setShowNewPassword((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors p-1" tabIndex={-1}>
                                            {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.new_password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{passwordErrors.new_password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Confirm Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors((p) => ({ ...p, confirmPassword: "" })); }}
                                            placeholder="Re-enter new password" autoComplete="new-password" className={inputCls(passwordErrors.confirmPassword)} />
                                        <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors p-1" tabIndex={-1}>
                                            {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>}
                                </div>
                            </motion.div>
                        )}

                        <button type="submit" disabled={isSubmitting || otp.join("").length < OTP_LENGTH}
                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isPasswordReset ? "Resetting Password…" : "Verifying…"}
                                </span>
                            ) : isPasswordReset ? "Reset Password" : "Verify Email"}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Didn't receive the code?{" "}
                                {canResend ? (
                                    <button type="button" onClick={handleResend} disabled={isResending}
                                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-60">
                                        <RotateCcw className="w-3.5 h-3.5" /> {isResending ? "Resending…" : "Resend OTP"}
                                    </button>
                                ) : <span className="font-semibold text-[var(--color-text-muted)]">Resend in {countdown}s</span>}
                            </p>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
                    {isPasswordReset ? "Remember your password? " : "Wrong email? "}
                    <button type="button" onClick={() => navigate(isPasswordReset ? "/login" : "/signup")}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        {isPasswordReset ? "Back to Login" : "Go back to Signup"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default OtpVerificationPage;