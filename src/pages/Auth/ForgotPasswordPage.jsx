import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, AlertCircle, KeyRound, CheckCircle } from "lucide-react";
import * as yup from "yup";
import api from "../../services/api";

const forgotSchema = yup.object().shape({
    email: yup
        .string()
        .email("Please enter a valid email address")
        .required("Email is required"),
});

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setError("");

        try {
            await forgotSchema.validate({ email });
        } catch (validationError) {
            setError(validationError.message);
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/auth/forgot-password/", { email });
            setSuccess(true);

            setTimeout(() => {
                navigate("/verify-otp", {
                    state: {
                        email,
                        isPasswordReset: true,
                    },
                });
            }, 2000);
        } catch (err) {
            const data = err.response?.data;
            const detail = data?.detail;
            const message = data?.message || data?.error;

            if (typeof detail === "string") {
                setApiError(detail);
            } else if (message) {
                setApiError(message);
            } else {
                setApiError("Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-green-50 px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-green-500 shadow-lg mb-4"
                    >
                        <KeyRound className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 mt-2">
                        Enter your email and we'll send you an OTP to reset your password
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8">

                    {apiError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{apiError}</span>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
                        >
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>OTP sent! Redirecting to verification...</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="forgot-email"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="forgot-email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                        setApiError("");
                                    }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${error
                                            ? "border-red-300 bg-red-50/40"
                                            : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                                        }`}
                                />
                            </div>
                            {error && (
                                <p className="mt-1.5 text-xs text-red-600">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || success}
                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending OTP…
                                </span>
                            ) : (
                                "Send OTP"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Remember your password?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;