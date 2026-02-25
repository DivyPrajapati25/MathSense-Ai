import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar/Navbar";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import FloatingBetaBanner from "./components/common/FloatingBetaBanner/FloatingBetaBanner";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const UploadPage = lazy(() => import("./pages/Upload/UploadPage"));
const GradingPage = lazy(() => import("./pages/Grading/GradingPage"));
const InsightsPage = lazy(() => import("./pages/Insights/InsightsPage"));
const FeedbackPage = lazy(() => import("./pages/Feedback/FeedbackPage"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 pb-16">
          <Navbar />

          <main className="relative">
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/grading" element={<GradingPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <FloatingBetaBanner />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
