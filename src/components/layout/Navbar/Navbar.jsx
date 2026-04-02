import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as yup from "yup";
import {
  Brain, Upload, BarChart2, BookOpen,
  Menu, X, LogOut, Pencil,
  User, Phone, Lock, Eye, EyeOff,
  Loader, AlertCircle, CheckCircle, ChevronDown,
  Camera, Trash2, Sun, Moon, Monitor,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  getUserProfile, updateUserProfile,
  getProfileImage, uploadProfileImage,
  updateProfileImage, deleteProfileImage,
  getProfileImageUrl,
} from "../../../services/userService";

const TEACHER_NAV_ITEMS = [
  { label: "Dashboard", icon: Brain, id: "dashboard", path: "/" },
  { label: "Upload", icon: Upload, id: "upload", path: "/upload" },
  { label: "Insights", icon: BarChart2, id: "insights", path: "/insights" },
];

const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", icon: Brain, id: "student-dashboard", path: "/student" },
  { label: "My Assignments", icon: BookOpen, id: "student-grading", path: "/student/grading" },
];

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// ─── Avatar Component ───
const Avatar = ({ src, name, size = "md", className = "" }) => {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [src]);
  const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-20 h-20 text-2xl" };
  const initial = name?.[0]?.toUpperCase() || "U";
  const showImage = src && !imgError;

  return showImage ? (
    <img src={src} alt={name || "Profile"} onError={() => setImgError(true)}
      className={`${sizes[size]} rounded-full object-cover shrink-0 ${className}`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-linear-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initial}
    </div>
  );
};

// ─── Yup schema ───
const editProfileSchema = yup.object().shape({
  first_name: yup.string().trim().required("First name is required").min(2, "Min 2 characters").max(50, "Max 50 characters"),
  last_name: yup.string().trim().max(50, "Max 50 characters").nullable(),
  phone: yup.string().matches(/^[0-9]+$/, "Digits only").min(10, "Must be 10 digits").max(10, "Must be 10 digits").nullable().transform((v) => v?.trim() || null),
  password: yup.string().nullable().transform((v) => v || null).test("pw-min", "Min 8 characters", (v) => !v || v.length >= 8),
});

// ─── Theme Toggle ───
const ThemeToggle = ({ compact = false }) => {
  const { preference, setTheme, toggleTheme, isDark } = useTheme();
  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  if (compact) {
    return (
      <button onClick={toggleTheme}
        className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] transition-colors">
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>
    );
  }

  return (
    <div className="flex items-center bg-[var(--color-bg-secondary)] rounded-lg p-0.5 border border-[var(--color-border)]">
      {options.map(({ value, icon: Icon }) => (
        <button key={value} onClick={() => setTheme(value)} title={value}
          className={`relative p-1.5 rounded-md transition-all ${
            preference === value
              ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          }`}>
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
};

// ─── Edit Profile Modal ───
const EditProfileModal = ({ profile, profileImageUrl, onClose, onSaved, onImageChanged }) => {
  const initialForm = {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    phone: profile?.phone ?? "",
    gender: profile?.gender ?? "MALE",
    password: "",
  };
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  const isDirty = form.first_name !== initialForm.first_name
    || form.last_name !== initialForm.last_name
    || form.phone !== initialForm.phone
    || form.gender !== initialForm.gender
    || form.password.length > 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSave = async () => {
    setApiError(""); setSuccess("");
    try {
      await editProfileSchema.validate({ ...form, phone: form.phone || null, password: form.password || null }, { abortEarly: false });
      setFieldErrors({});
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach((err) => { if (!errors[err.path]) errors[err.path] = err.message; });
      setFieldErrors(errors);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name?.trim() || null,
        phone: form.phone?.trim() || null,
        gender: form.gender,
        role: profile?.role,
        ...(form.password ? { password: form.password } : {}),
      };
      await updateUserProfile(payload);
      setSuccess("Profile updated successfully!");
      onSaved(payload);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.detail;
      setApiError(!err.response ? "Network error." : typeof message === "string" ? message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setApiError("Image must be under 5 MB."); return; }
    if (!file.type.startsWith("image/")) { setApiError("Only image files are allowed."); return; }

    setImageLoading(true); setApiError("");
    try {
      const res = profileImageUrl
        ? await updateProfileImage(file)
        : await uploadProfileImage(file);
      const newPath = res.data?.data?.profile_image_path;
      onImageChanged(newPath);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail;
      setApiError(typeof msg === "string" ? msg : "Failed to upload image.");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageDelete = async () => {
    setImageLoading(true); setApiError("");
    try {
      await deleteProfileImage();
      onImageChanged(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail;
      setApiError(typeof msg === "string" ? msg : "Failed to delete image.");
    } finally {
      setImageLoading(false);
    }
  };

  const inputCls = (field) => `w-full pl-10 pr-4 h-10 rounded-xl border text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${fieldErrors[field] ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)]"}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-md flex flex-col max-h-[85vh]">
        <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Edit Profile</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Update your personal information</p>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-bg-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar src={profileImageUrl} name={form.first_name} size="lg" />
              {imageLoading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageLoading}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50">
                <Camera className="w-3.5 h-3.5" />
                {profileImageUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {profileImageUrl && (
                <button type="button" onClick={handleImageDelete} disabled={imageLoading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800 bg-[var(--color-bg-card)] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Email</span>
              <span className="font-medium text-[var(--color-text-primary)] truncate ml-4">{profile?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Role</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${profile?.role === "TEACHER" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}`}>
                {profile?.role}
              </span>
            </div>
          </div>

          {apiError && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{apiError}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">First Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input name="first_name" value={form.first_name} onChange={handleChange} maxLength={50} className={inputCls("first_name")} placeholder="First name" />
            </div>
            {fieldErrors.first_name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.first_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input name="last_name" value={form.last_name} onChange={handleChange} maxLength={50} className={inputCls("last_name")} placeholder="Last name" />
            </div>
            {fieldErrors.last_name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.last_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} className={inputCls("phone")} placeholder="10 digit phone number" />
            </div>
            {fieldErrors.phone && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button key={g} type="button"
                  onClick={() => setForm((p) => ({ ...p, gender: g }))}
                  className={`h-10 rounded-xl text-sm font-medium border transition-all ${form.gender === g
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)]"
                  }`}>
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              New Password
              <span className="text-[var(--color-text-muted)] font-normal ml-1 text-xs">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input name="password" type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                className={`w-full pl-10 pr-10 h-10 rounded-xl border text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${fieldErrors.password ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)]"}`}
                placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" tabIndex={-1}>
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex gap-3 justify-end bg-[var(--color-bg-secondary)] rounded-b-2xl">
          <button onClick={onClose} disabled={isSaving}
            className="h-10 px-5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving || !isDirty}
            className="h-10 px-5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm">
            {isSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Dropdown ───
const ProfileDropdown = ({ user, profileImageUrl, onEditClick, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.95 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-12 w-64 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] shadow-xl z-50 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <Avatar src={profileImageUrl} name={user?.first_name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user?.first_name} {user?.last_name || ""}</p>
          <p className="text-xs text-[var(--color-text-secondary)] truncate">{user?.email}</p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 ${user?.role === "TEACHER" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}`}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
    <div className="p-2 space-y-1">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs text-[var(--color-text-secondary)] font-medium">Theme</span>
        <ThemeToggle />
      </div>
      <button onClick={onEditClick}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
        <Pencil className="w-4 h-4 text-[var(--color-text-muted)]" /> Edit Profile
      </button>
      <button onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  </motion.div>
);

// ─── Nav Item ───
const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <button onClick={() => onClick(item)}
      className={`relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-8 rounded-md gap-1.5 px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150 cursor-pointer ${isActive ? "text-white" : "text-[var(--color-text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}>
      {isActive && (
        <motion.span layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-blue-600 shadow-md"
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
          style={{ zIndex: -1 }} />
      )}
      <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
      {item.label}
    </button>
  );
};

// ─── Mobile Menu ───
const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};
const mobileItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
};
const mobileContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const MobileMenu = ({ navItems, activePath, onItemClick, onClose, onLogout, onEditProfile, user, profileImageUrl }) => (
  <motion.div
    className="lg:hidden overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg-card)]"
    variants={mobileMenuVariants} initial="hidden" animate="visible" exit="hidden">
    <motion.div className="px-4 pt-3 pb-4 space-y-1" variants={mobileContainerVariants} initial="hidden" animate="visible">
      <motion.div variants={mobileItemVariants}
        className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <Avatar src={profileImageUrl} name={user?.first_name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.first_name} {user?.last_name || ""}</p>
          <p className="text-xs text-[var(--color-text-secondary)] capitalize">{user?.role?.toLowerCase()}</p>
        </div>
      </motion.div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;
        return (
          <motion.button key={item.id} variants={mobileItemVariants}
            onClick={() => { onItemClick(item); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 min-h-[44px] ${isActive ? "bg-blue-600 text-white" : "text-[var(--color-text-secondary)] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"}`}>
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </motion.button>
        );
      })}

      <motion.div variants={mobileItemVariants} className="pt-2 space-y-2">
        <ThemeToggle compact />
        <button onClick={() => { onEditProfile(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-colors">
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </motion.div>
    </motion.div>
  </motion.div>
);

// ─── Main Navbar ───
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileImagePath, setProfileImagePath] = useState(null);
  const dropdownRef = useRef(null);

  const activePath = location.pathname;
  const navItems = user?.role === "STUDENT" ? STUDENT_NAV_ITEMS : TEACHER_NAV_ITEMS;
  const profileImageUrl = getProfileImageUrl(profileImagePath);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data?.data ?? null);
    } catch { }
    try {
      const res = await getProfileImage();
      setProfileImagePath(res.data?.data?.profile_image_path ?? null);
    } catch { }
  }, []);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  const handleProfileClick = () => setProfileDropOpen((p) => !p);
  const handleEditClick = () => { setProfileDropOpen(false); setEditModalOpen(true); };
  const handleProfileSaved = (updatedData) => setProfile((prev) => ({ ...prev, ...updatedData }));
  const handleImageChanged = (newPath) => setProfileImagePath(newPath);
  const handleNavClick = (item) => navigate(item.path);
  const displayName = profile?.first_name || user?.first_name || "User";

  return (
    <>
      <div className="sticky top-0 z-50 bg-[var(--color-bg-card)]/95 backdrop-blur-sm border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div onClick={() => navigate(user?.role === "STUDENT" ? "/student" : "/")} className="cursor-pointer">
              <Logo />
            </div>

            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavItem key={item.id} item={item} isActive={activePath === item.path} onClick={handleNavClick} />
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button onClick={handleProfileClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                  <Avatar src={profileImageUrl} name={displayName} size="xs" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)] max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform duration-200 ${profileDropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileDropOpen && (
                    <ProfileDropdown user={profile || user} profileImageUrl={profileImageUrl} onEditClick={handleEditClick} onLogout={logout} />
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setMobileOpen((p) => !p)}
                className="lg:hidden inline-flex items-center justify-center h-[44px] min-w-[44px] rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Toggle menu" aria-expanded={mobileOpen}>
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <MobileMenu
              navItems={navItems}
              activePath={activePath}
              onItemClick={handleNavClick}
              onClose={() => setMobileOpen(false)}
              onLogout={logout}
              onEditProfile={handleEditClick}
              user={profile || user}
              profileImageUrl={profileImageUrl}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <EditProfileModal
            profile={profile || user}
            profileImageUrl={profileImageUrl}
            onClose={() => setEditModalOpen(false)}
            onSaved={handleProfileSaved}
            onImageChanged={handleImageChanged}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;