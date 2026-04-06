import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Trophy, TrendingUp,
  Clock, CheckCircle, XCircle, Loader,
  AlertCircle, AlertTriangle, ChevronRight,
  Minus, Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStudentDashboard, getAssignmentsList } from "../../services/studentService";
import { StatCard, TrendChart } from "./StudentComponents";
import { TaskStatusBanner } from "./StudentModals";

const PERIODS = ["week", "month", "year"];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const trendRef = useRef(null);
  const [period, setPeriod] = useState("week");
  const [periodValue, setPeriodValue] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError("");
    Promise.all([
      getStudentDashboard({ trendType: period, value: periodValue }),
      getAssignmentsList({ page: 1, pageSize: 3 }),
    ])
      .then(([dashRes, assRes]) => {
        setDashboardData(dashRes.data?.data ?? null);
        setPreviewData(assRes.data?.data ?? null);
      })
      .catch(() => setError("Failed to load dashboard. Please try again."))
      .finally(() => setIsLoading(false));
  }, [period, periodValue]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
        </div>
      </div>
    );
  }

  const dashboard = dashboardData?.dashboard;
  const trendData = dashboardData?.trend ?? [];
  const improvementAreas = dashboard?.improvement_areas ?? [];

  const stats = [
    { icon: BookOpen,    label: "Total Assignments", value: dashboard?.total_assignments ?? 0,    color: "blue",   delay: 0.05, onClick: () => navigate("/student/grading") },
    { icon: CheckCircle, label: "Attended",           value: dashboard?.assignments_attended ?? 0,  color: "green",  delay: 0.10, onClick: () => navigate("/student/grading?tab=attempted") },
    { icon: Trophy,      label: "Average Score",      value: `${dashboard?.average_score ?? 0}%`,  color: "purple", delay: 0.15, onClick: () => { trendRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } },
    { icon: XCircle,     label: "Missed",             value: dashboard?.skipped_assignments ?? 0,  color: "red",    delay: 0.20, onClick: () => navigate("/student/grading?tab=missed") },
  ];

  // Top 3 pending assignments preview
  const pendingPreview = previewData?.not_attempted?.assignments?.slice(0, 3) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Welcome back, {user?.first_name || "Student"} 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Here's your performance overview</p>
      </motion.div>

      <AnimatePresence>
        {activeTaskId && (
          <TaskStatusBanner
            assignmentId={activeTaskId}
            onDismiss={() => setActiveTaskId(null)}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats Grid — 4 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Performance Trend */}
          <motion.div ref={trendRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6 scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Performance Trend
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {PERIODS.map((p) => (
                  <button key={p} onClick={() => { setPeriod(p); setPeriodValue(1); }}
                    className={`h-8 px-3 rounded-md text-sm font-medium capitalize transition-all ${
                      period === p ? "bg-blue-600 text-white shadow-sm" : "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                    }`}>{p}</button>
                ))}

                <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] h-8 px-1.5 ml-1">
                  <button onClick={() => setPeriodValue(Math.max(1, periodValue - 1))} disabled={periodValue <= 1}
                    className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] min-w-[48px] text-center">Last {periodValue}</span>
                  <button onClick={() => setPeriodValue(periodValue + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <TrendChart trendData={trendData} />
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Score per assignment</span>
            </div>
          </motion.div>

          {/* Improvement Areas */}
          {improvementAreas.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" /> Areas to Improve
              </h3>
              <div className="space-y-4">
                {improvementAreas.map((area) => (
                  <div key={area.topic} className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-[var(--color-text-primary)]">{area.topic}</span>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{area.mistake_rate}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${area.mistake_rate}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }} className="h-2 rounded-full bg-orange-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pending Assignments Preview */}
          {pendingPreview.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Upcoming Assignments
                </h3>
                <button onClick={() => navigate("/student/grading")}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {pendingPreview.map((a, i) => (
                  <div key={a.teacher_assignment_id}
                    className="flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-all">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--color-text-primary)] truncate">{a.assignment_name}</h4>
                      <p className="text-sm text-orange-500 dark:text-orange-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Due {new Date(a.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;