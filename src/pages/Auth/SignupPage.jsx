import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, Eye, EyeOff, User, Phone, UserPlus,
    AlertCircle, ChevronDown,
} from "lucide-react";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContext";

const signupSchema = yup.object().shape({
    first_name: yup
        .string()
        .trim()
        .required("First name is required")
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be at most 50 characters"),
       
    last_name: yup
        .string()
        .trim()
        .max(50, "Last name must be at most 50 characters")
        .nullable(),
    gender: yup
        .string()
        .oneOf(["MALE", "FEMALE", "OTHER"], "Please select your gender")
        .required("Gender is required"),
    role: yup
        .string()
        .oneOf(["TEACHER", "STUDENT"], "Please select a role")
        .required("Role is required"),
    email: yup
        .string()
        .transform((value) => value?.trim())
        .email("Please enter a valid email")
        .max(254, "Email address is too long")
        .required("Email is required"),
    phone: yup
        .string()
        .min(10, "Phone must be 10 digits")
        .max(10, "Phone must be 10 digits")
        .matches(/^[0-9]+$/, "Phone must contain only digits")
        .required("Phone number is required"),
    password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm your password"),
    standard: yup
        .number()
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        )
        .when("role", {
            is: "STUDENT",
            then: (schema) =>
                schema
                    .typeError("Standard must be a number")
                    .required("Standard is required for students")
                    .min(1, "Standard must be between 1 and 12")
                    .max(12, "Standard must be between 1 and 12"),
            otherwise: (schema) => schema.nullable(),
        }),
});

const GENDER_OPTIONS = [
    { value: "", label: "Select Gender" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
];

const ROLE_OPTIONS = [
    { value: "", label: "Select Role" },
    { value: "TEACHER", label: "Teacher" },
    { value: "STUDENT", label: "Student" },
];

const INITIAL_FORM = {
    first_name: "",
    last_name: "",
    gender: "",
    role: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    standard: "",
};

const InputField = ({
    id, label, icon: Icon, type = "text", name, value, onChange,
    error, placeholder, rightElement, autoComplete, maxLength
}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                id={id}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                maxLength={maxLength}
                className={`w-full pl-11 ${rightElement ? "pr-12" : "pr-4"} py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${error
                    ? "border-red-300 bg-red-50/40"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                    }`}
            />
            {rightElement}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
);

const SelectField = ({ id, label, icon: Icon, name, value, onChange, error, options }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full pl-11 pr-10 py-3 rounded-xl border text-sm transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${error
                    ? "border-red-300 bg-red-50/40"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                    }`}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={!opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
);

const PasswordToggle = ({ show, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
        tabIndex={-1}
    >
        {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
);

const SignupPage = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        if (apiError) setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        const trimmedFormData = {
            ...formData,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name?.trim() || null,
            email: formData.email.trim(),
        };

        try {
            await signupSchema.validate(trimmedFormData, { abortEarly: false });
            setErrors({});
        } catch (validationError) {
            const fieldErrors = {};
            validationError.inner.forEach((err) => {
                if (!fieldErrors[err.path]) fieldErrors[err.path] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await signup(trimmedFormData);
            navigate("/verify-otp", { state: { email: trimmedFormData.email } });
        } catch (err) {
            const data = err.response?.data;
            const status = err.response?.status;
            const detail = data?.detail;
            const message = data?.message || data?.error;

            if (!err.response) {
                setApiError("Network error. Please check your internet connection.");
            } else if (status === 409) {
                setApiError(detail || message || "An account with this email or phone already exists.");
            } else if (status === 422) {
                if (Array.isArray(detail)) {
                    setApiError(detail.map((d) => d.msg || d.message || d).join(", "));
                } else {
                    setApiError(detail || message || "Invalid data. Please check your inputs.");
                }
            } else if (status === 500) {
                setApiError("Something went wrong on our end. Please try again later.");
            } else if (Array.isArray(detail)) {
                setApiError(detail.map((d) => d.msg || d.message || d).join(", "));
            } else if (typeof detail === "string") {
                setApiError(detail);
            } else if (message) {
                setApiError(message);
            } else {
                setApiError("Signup failed. Please try again.");
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
                className="w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-green-500 shadow-lg mb-4"
                    >
                        <UserPlus className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 mt-2">
                        Join MathSense AI and transform your teaching
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

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                id="signup-firstname"
                                maxLength={50}
                                label="First Name *"
                                icon={User}
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                error={errors.first_name}
                                placeholder="Alice"
                                autoComplete="given-name"
                            />
                            <InputField
                                id="signup-lastname"
                                maxLength={50}
                                label="Last Name"
                                icon={User}
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                error={errors.last_name}
                                placeholder="Johnson"
                                autoComplete="family-name"
                            />
                        </div>

                        <InputField
                            id="signup-email"
                            maxLength={254}
                            label="Email Address *"
                            icon={Mail}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />

                        <InputField
                            id="signup-phone"
                            maxLength={10}
                            label="Phone Number *"
                            icon={Phone}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="9876543210"
                            autoComplete="tel"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectField
                                id="signup-gender"
                                label="Gender *"
                                icon={User}
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                error={errors.gender}
                                options={GENDER_OPTIONS}
                            />
                            <SelectField
                                id="signup-role"
                                label="Role *"
                                icon={User}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                error={errors.role}
                                options={ROLE_OPTIONS}
                            />
                        </div>

                        <AnimatePresence>
                            {formData.role === "STUDENT" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <SelectField
                                        id="signup-standard"
                                        label="Standard / Class *"
                                        icon={User}
                                        name="standard"
                                        value={formData.standard}
                                        onChange={handleChange}
                                        error={errors.standard}
                                        options={[
                                            { value: "", label: "Select Standard" },
                                            ...Array.from({ length: 12 }, (_, i) => ({
                                                value: String(i + 1),
                                                label: `Class ${i + 1}`,
                                            })),
                                        ]}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <InputField
                            id="signup-password"
                            label="Password *"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            rightElement={
                                <PasswordToggle
                                    show={showPassword}
                                    onToggle={() => setShowPassword((p) => !p)}
                                />
                            }
                        />

                        <InputField
                            id="signup-confirm"
                            label="Confirm Password *"
                            icon={Lock}
                            type={showConfirm ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="Re-enter password"
                            autoComplete="new-password"
                            rightElement={
                                <PasswordToggle
                                    show={showConfirm}
                                    onToggle={() => setShowConfirm((p) => !p)}
                                />
                            }
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Account…
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;