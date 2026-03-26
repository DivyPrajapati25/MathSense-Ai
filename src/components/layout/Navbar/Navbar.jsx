import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as yup from "yup"; // ✅ added yup
import {
  Brain, Upload, CircleCheckBig, BarChart2,
  MessageSquare, Menu, X, LogOut, Pencil,
  User, Phone, Lock, Eye, EyeOff,
  Loader, AlertCircle, CheckCircle, ChevronDown,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

const TEACHER_NAV_ITEMS = [
  { label: "Dashboard", icon: Brain, id: "dashboard", path: "/" },
  { label: "Upload", icon: Upload, id: "upload", path: "/upload" },
  { label: "Grading", icon: CircleCheckBig, id: "grading", path: "/grading" },
  { label: "Insights", icon: BarChart2, id: "insights", path: "/insights" },
  { label: "Feedback", icon: MessageSquare, id: "feedback", path: "/feedback" },
];

const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", icon: Brain, id: "student-dashboard", path: "/student" },
];

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];

// ✅ Yup validation schema — same pattern as SignupPage
const editProfileSchema = yup.object().shape({
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
  phone: yup
    .string()
    .matches(/^[0-9]+$/, "Phone must contain only digits")
    .min(10, "Phone must be 10 digits")
    .max(10, "Phone must be 10 digits")
    .nullable()
    .transform((value) => value?.trim() || null),
  password: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .test(
      "password-min",
      "Password must be at least 8 characters",
      (value) => !value || value.length >= 8
    ),
});

// ✅ Edit Profile Modal
const EditProfileModal = ({ profile, onClose, onSaved }) => {
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    phone: profile?.phone ?? "",
    gender: profile?.gender ?? "MALE",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // ✅ Clear field error on change — same as SignupPage
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSave = async () => {
    setApiError("");
    setSuccess("");

    // ✅ Validate with yup — same pattern as SignupPage
    try {
      await editProfileSchema.validate(
        { ...form, phone: form.phone || null, password: form.password || null },
        { abortEarly: false }
      );
      setFieldErrors({});
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach((err) => {
        if (!errors[err.path]) errors[err.path] = err.message;
      });
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
        role: profile?.role, // ✅ always preserve role
        ...(form.password ? { password: form.password } : {}),
      };
      await api.patch("/user/", payload);
      setSuccess("Profile updated successfully!");
      onSaved(payload);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.detail;
      setApiError(!err.response ? "Network error. Please check your connection."
        : typeof message === "string" ? message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update your personal information</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Read-only info */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800 truncate ml-4">{profile?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Role</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${profile?.role === "TEACHER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                {profile?.role}
              </span>
            </div>
          </div>

          {apiError && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{apiError}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{success}</span>
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="first_name" value={form.first_name} onChange={handleChange} maxLength={50}
                className={`w-full pl-10 pr-4 h-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${fieldErrors.first_name ? "border-red-300 bg-red-50/40" : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}`}
                placeholder="First name" />
            </div>
            {fieldErrors.first_name && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.first_name}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="last_name" value={form.last_name} onChange={handleChange} maxLength={50}
                className={`w-full pl-10 pr-4 h-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${fieldErrors.last_name ? "border-red-300 bg-red-50/40" : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}`}
                placeholder="Last name" />
            </div>
            {fieldErrors.last_name && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.last_name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="phone" value={form.phone} onChange={handleChange} maxLength={10}
                className={`w-full pl-10 pr-4 h-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${fieldErrors.phone ? "border-red-300 bg-red-50/40" : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}`}
                placeholder="10 digit phone number" />
            </div>
            {fieldErrors.phone && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button key={g} type="button"
                  onClick={() => setForm((p) => ({ ...p, gender: g }))}
                  className={`h-10 rounded-xl text-sm font-medium border transition-all ${form.gender === g
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}>
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
              <span className="text-gray-400 font-normal ml-1 text-xs">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="password" type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                className={`w-full pl-10 pr-10 h-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${fieldErrors.password ? "border-red-300 bg-red-50/40" : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}`}
                placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={isSaving}
            className="h-10 px-5 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="h-10 px-5 rounded-xl text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
            {isSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Profile Dropdown
const ProfileDropdown = ({ user, onEditClick, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.95 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-12 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {user?.first_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{user?.first_name} {user?.last_name || ""}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 ${user?.role === "TEACHER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
    <div className="p-2">
      <button onClick={onEditClick}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <Pencil className="w-4 h-4 text-gray-400" /> Edit Profile
      </button>
      <button onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  </motion.div>
);

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <button onClick={() => onClick(item)}
      className={`relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-8 rounded-md gap-1.5 px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150 cursor-pointer ${isActive ? "text-white hover:bg-black" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}>
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

const JoinBetaButton = ({ full = false }) => (
  <button className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 outline-none h-9 px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg cursor-pointer ${full ? "w-full" : ""}`}>
    Join Beta
  </button>
);

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

const MobileMenu = ({ navItems, activePath, onItemClick, onClose, onLogout, onEditProfile, user }) => (
  <motion.div
    className="lg:hidden overflow-hidden border-t border-blue-100 bg-white"
    variants={mobileMenuVariants} initial="hidden" animate="visible" exit="hidden">
    <motion.div className="px-4 pt-3 pb-4 space-y-1" variants={mobileContainerVariants} initial="hidden" animate="visible">
      <motion.div variants={mobileItemVariants}
        className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-blue-50/60 border border-blue-100">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {user?.first_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.first_name} {user?.last_name || ""}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
        </div>
      </motion.div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;
        return (
          <motion.button key={item.id} variants={mobileItemVariants}
            onClick={() => { onItemClick(item); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 min-h-[44px] ${isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}>
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </motion.button>
        );
      })}

      <motion.div variants={mobileItemVariants} className="pt-2 space-y-2">
        <JoinBetaButton full />
        <button onClick={() => { onEditProfile(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors">
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </motion.div>
    </motion.div>
  </motion.div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);

  const activePath = location.pathname;
  const navItems = user?.role === "STUDENT" ? STUDENT_NAV_ITEMS : TEACHER_NAV_ITEMS;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleProfileClick = async () => {
    setProfileDropOpen((p) => !p);
    if (!profile) {
      try {
        const res = await api.get("/user/");
        setProfile(res.data?.data ?? null);
      } catch { }
    }
  };

  const handleEditClick = () => {
    setProfileDropOpen(false);
    setEditModalOpen(true);
  };

  const handleProfileSaved = (updatedData) => {
    setProfile((prev) => ({ ...prev, ...updatedData }));
  };

  const handleNavClick = (item) => navigate(item.path);
  const displayName = profile?.first_name || user?.first_name || "User";

  return (
    <>
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
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
              {/* Profile badge */}
              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button onClick={handleProfileClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-600 to-green-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {displayName[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${profileDropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileDropOpen && (
                    <ProfileDropdown user={profile || user} onEditClick={handleEditClick} onLogout={logout} />
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden lg:flex">
                <JoinBetaButton />
              </div>

              <button onClick={() => setMobileOpen((p) => !p)}
                className="lg:hidden inline-flex items-center justify-center h-[44px] min-w-[44px] rounded-md text-gray-600 hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            />
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Modal outside navbar — correct z-index */}
      <AnimatePresence>
        {editModalOpen && (
          <EditProfileModal
            profile={profile || user}
            onClose={() => setEditModalOpen(false)}
            onSaved={handleProfileSaved}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;