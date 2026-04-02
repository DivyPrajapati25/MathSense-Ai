import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/common/Toast/Toast";
import Navbar from "./components/layout/Navbar/Navbar";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute";
import GuestRoute from "./components/common/GuestRoute/GuestRoute";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const UploadPage = lazy(() => import("./pages/Upload/UploadPage"));
const InsightsPage = lazy(() => import("./pages/Insights/InsightsPage"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const LoginPage = lazy(() => import("./pages/Auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/Auth/SignupPage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard/StudentDashboard"));
const StudentGrading = lazy(() => import("./pages/StudentDashboard/StudentGrading"));
const OtpVerificationPage = lazy(() => import("./pages/Auth/OtpVerificationPage"));
const ForgotPasswordPage = lazy(() => import("./pages/Auth/ForgotPasswordPage"));
const StudentAssignmentDetail = lazy(() => import("./pages/StudentDashboard/StudentAssignmentDetail"));
const AssignmentDetailPage = lazy(() => import("./pages/Dashboard/AssignmentDetail/AssignmentDetailPage"));

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/verify-otp"];

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
    <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppShell = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const showNavbar = isAuthenticated && !isAuthPage;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-16 transition-colors duration-300">
      {showNavbar && <Navbar />}

      <main className="relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/verify-otp" element={<GuestRoute><OtpVerificationPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

            <Route path="/" element={<ProtectedRoute allowedRoles={["TEACHER"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute allowedRoles={["TEACHER"]}><UploadPage /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute allowedRoles={["TEACHER"]}><InsightsPage /></ProtectedRoute>} />
            <Route path="/assignment/:id" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AssignmentDetailPage /></ProtectedRoute>} />

            <Route path="/student" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/grading" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentGrading /></ProtectedRoute>} />
            <Route path="/student/assignment/:id" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAssignmentDetail /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </ErrorBoundary>
);

export default App;
