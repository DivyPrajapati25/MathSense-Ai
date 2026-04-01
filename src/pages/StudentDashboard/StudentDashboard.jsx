import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Trophy, Target, TrendingUp,
  Upload, Clock, CheckCircle, XCircle, Loader,
  AlertCircle, FileText, ChevronRight, X, AlertTriangle,
  CalendarClock, ChevronLeft, Award, BarChart2, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast/Toast";
import { formatDate } from "../../utils/formatDate";
import {
  getStudentDashboard, uploadStudentAssignment,
  getUploadStatus, getAssignmentsList,
} from "../../services/studentService";

const PERIODS = ["week", "month", "year"];
const TABS = [
  { key: "not_attempted", label: "Pending",   icon: Clock },
  { key: "attempted",     label: "Submitted", icon: CheckCircle },
  { key: "missed",        label: "Missed",    icon: XCircle },
];

// ✅ Max polling duration: 3 minutes (60 attempts × 3s = 180s)
const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS  = 3000;

const ScoreBadge = ({ percentage }) => {
  const cls =
    percentage >= 80 ? "bg-green-50 text-green-700 border-green-200"
    : percentage >= 50 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
      {percentage}%
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => {
  const palette = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   val: "text-blue-700"   },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  val: "text-green-700"  },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", val: "text-purple-700" },
    orange: { bg: "bg-orange-50", icon: "text-orange-500", val: "text-orange-600" },
    red:    { bg: "bg-red-50",    icon: "text-red-500",    val: "text-red-600"    },
  };
  const c = palette[color] ?? palette.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
    >
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
    </motion.div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1 truncate max-w-[160px]">{label}</p>
      <p className="text-blue-600 font-semibold">Score: {payload[0]?.value}%</p>
    </div>
  );
};

const TrendChart = ({ trendData }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const chartData = trendData.map((t) => ({ label: t.assignment_name, value: t.score ?? 0 }));

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-gray-400 text-sm gap-2">
        <BarChart2 className="w-8 h-8 text-gray-200" />
        No trend data available yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      {ready && (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="value" name="Score"
              stroke="#3B82F6" strokeWidth={3} fill="url(#studentGrad)"
              dot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive animationDuration={1200} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const UploadModal = ({ assignment, onClose, onSuccess }) => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else toast.error("Only PDF files are accepted.");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    try {
      const res = await uploadStudentAssignment(file, assignment.teacher_assignment_id);
      const studentAssignmentId = res.data?.data?.student_assignment_id;
      toast.success("Uploaded! AI is evaluating your answers.");
      onSuccess(studentAssignmentId);
      onClose();
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 409) {
        const msg = typeof message === "object" ? message.message : message;
        toast.error(msg || "You have already submitted this assignment.");
      } else if (status === 403) {
        toast.error(message || "Assignment not published or deadline passed.");
      } else if (!err.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(typeof message === "string" ? message : "Upload failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submit Assignment</h2>
            <p className="text-sm text-gray-500 mt-0.5">Upload your answer as a PDF</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">{assignment.assignment_name}</p>
            <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
              <CalendarClock className="w-3 h-3" /> Due {formatDate(assignment.deadline)}
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl min-h-[110px] flex flex-col items-center justify-center gap-2 transition-all ${
            dragOver ? "border-blue-400 bg-blue-50"
            : file ? "border-green-300 bg-green-50"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          {file ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <p className="text-sm font-medium text-green-700">{file.name}</p>
              <p className="text-xs text-green-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Drop PDF here or click to browse</p>
              <p className="text-xs text-gray-400">Max file size: 30 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={isSubmitting}
            className="flex-1 h-10 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!file || isSubmitting}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center gap-2">
            {isSubmitting
              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
              : <><Upload className="w-4 h-4" /> Submit</>}
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* ─── Task Status Banner ─── */
const TaskStatusBanner = ({ assignmentId, onDismiss, onCompleted }) => {
  const [status, setStatus] = useState("PENDING");
  const [timedOut, setTimedOut] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!assignmentId) return;

    attemptsRef.current = 0;
    setTimedOut(false);
    setStatus("PENDING");

    const poll = setInterval(async () => {
      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(poll);
        setTimedOut(true);
        return;
      }
      attemptsRef.current += 1;

      try {
        const res = await getUploadStatus(assignmentId);
        const s = res.data?.data?.status;
        const errMsg = res.data?.data?.error_message;
        setStatus(s);

        if (s === "COMPLETED" || s === "FAILED") {
          clearInterval(poll);
          if (s === "COMPLETED") onCompleted?.();
        }
        if (errMsg && s === "PROCESSING") {
          clearInterval(poll);
          setStatus("FAILED");
        }
      } catch {
        clearInterval(poll);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(poll);
  }, [assignmentId]);

  const cfg = {
    PENDING:    { bg: "bg-amber-50 border-amber-200",  text: "text-amber-700",  icon: Loader,      spin: true,  msg: "Assignment queued — AI will start shortly" },
    PROCESSING: { bg: "bg-blue-50 border-blue-200",    text: "text-blue-700",   icon: Loader,      spin: true,  msg: "AI is evaluating your answers..." },
    COMPLETED:  { bg: "bg-green-50 border-green-200",  text: "text-green-700",  icon: CheckCircle, spin: false, msg: "Evaluation complete! Check your results. 🎉" },
    FAILED:     { bg: "bg-red-50 border-red-200",      text: "text-red-600",    icon: XCircle,     spin: false, msg: "Processing failed. Please re-upload." },
  };

  if (timedOut) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium bg-orange-50 border-orange-200 text-orange-700">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="flex-1">Processing is taking longer than expected. Please refresh the page to check status.</span>
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  const c = cfg[status] ?? cfg.PENDING;
  const Icon = c.icon;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${c.bg} ${c.text}`}>
      <Icon className={`w-5 h-5 shrink-0 ${c.spin ? "animate-spin" : ""}`} />
      <span className="flex-1">{c.msg}</span>
      {(status === "COMPLETED" || status === "FAILED") && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

const AttemptedRow = ({ assignment, index }) => {
  const navigate = useNavigate();
  const pct = assignment.total_marks > 0
    ? Math.round((assignment.total_rewarded_marks / assignment.total_marks) * 100)
    : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/student/assignment/${assignment.student_assignment_id}`)}
      className="group flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm hover:border-blue-200 border border-transparent transition-all cursor-pointer"
    >
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{assignment.assignment_name}</h4>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(assignment.submitted_on)}
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3 text-blue-400" />
            <strong className="text-gray-700">{assignment.total_rewarded_marks}</strong>/{assignment.total_marks} marks
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ScoreBadge percentage={pct} />
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
      </div>
    </motion.div>
  );
};

const NotAttemptedRow = ({ assignment, onUpload, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all"
  >
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
      <FileText className="w-5 h-5 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900 truncate">{assignment.assignment_name}</h4>
      <p className="text-sm text-orange-500 flex items-center gap-1 mt-0.5">
        <CalendarClock className="w-3 h-3" /> Due {formatDate(assignment.deadline)}
      </p>
    </div>
    <button onClick={() => onUpload(assignment)}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0">
      <Upload className="w-4 h-4" /> Upload
    </button>
  </motion.div>
);

const MissedRow = ({ assignment, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg opacity-60"
  >
    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
      <XCircle className="w-5 h-5 text-red-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900 truncate">{assignment.assignment_name}</h4>
      <p className="text-sm text-red-400 flex items-center gap-1 mt-0.5">
        <CalendarClock className="w-3 h-3" /> Deadline passed: {formatDate(assignment.deadline)}
      </p>
    </div>
    <span className="text-xs font-medium text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded-md shrink-0">Missed</span>
  </motion.div>
);

const EmptyState = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-gray-200">
    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
      {tab === "not_attempted" ? <Zap className="w-5 h-5 text-gray-300" />
      : tab === "attempted" ? <Trophy className="w-5 h-5 text-gray-300" />
      : <CheckCircle className="w-5 h-5 text-gray-300" />}
    </div>
    <p className="text-gray-400 text-sm">
      {tab === "not_attempted" ? "No pending assignments — you're all caught up!"
      : tab === "attempted" ? "No submissions yet."
      : "No missed assignments. Great job!"}
    </p>
  </div>
);

const Pagination = ({ pagination, page, onPageChange }) => {
  if (!pagination || pagination.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Page {page} of {pagination.total_pages} ({pagination.total} total)
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!pagination.has_previous}
          className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600 font-medium">{page} / {pagination.total_pages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.has_next}
          className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("week");
  const [dashboardData, setDashboardData] = useState(null);
  const [assignmentsData, setAssignmentsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("not_attempted");

  // ✅ Per-tab page state — each tab remembers its own page independently
  const [pages, setPages] = useState({
    not_attempted: 1,
    attempted: 1,
    missed: 1,
  });

  const [uploadTarget, setUploadTarget] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Helper to get/set current tab's page
  const currentPage = pages[activeTab];
  const setCurrentPage = (updater) => {
    setPages((prev) => ({
      ...prev,
      [activeTab]: typeof updater === "function" ? updater(prev[activeTab]) : updater,
    }));
  };

  // ✅ Re-fetch when period, activeTab, or any tab's page changes
  useEffect(() => {
    setIsLoading(true);
    setError("");
    Promise.all([
      getStudentDashboard({ trendType: period, value: 1 }),
      getAssignmentsList({ page: pages[activeTab], pageSize: 10 }),
    ])
      .then(([dashRes, assRes]) => {
        setDashboardData(dashRes.data?.data ?? null);
        setAssignmentsData(assRes.data?.data ?? null);
      })
      .catch(() => setError("Failed to load dashboard. Please try again."))
      .finally(() => setIsLoading(false));
  }, [period, activeTab, pages]);

  const refreshAssignments = () => {
    getAssignmentsList({ page: pages[activeTab], pageSize: 10 })
      .then((res) => setAssignmentsData(res.data?.data ?? null))
      .catch(() => {});
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
        </div>
      </div>
    );
  }

  const dashboard = dashboardData?.dashboard;
  const trendData = dashboardData?.trend ?? [];
  const improvementAreas = dashboard?.improvement_areas ?? [];

  const stats = [
    { icon: BookOpen,      label: "Total Assignments",  value: dashboard?.total_assignments ?? 0,    color: "blue",   delay: 0.05 },
    { icon: CheckCircle,   label: "Attended",           value: dashboard?.assignments_attended ?? 0,  color: "green",  delay: 0.10 },
    { icon: Trophy,        label: "Average Score",      value: `${dashboard?.average_score ?? 0}%`,  color: "purple", delay: 0.15 },
    { icon: Target,        label: "Best Score",         value: `${dashboard?.best_score ?? 0}%`,     color: "orange", delay: 0.20 },
    { icon: AlertTriangle, label: "Mistake Rate",       value: `${dashboard?.mistake_rate ?? 0}%`,   color: "red",    delay: 0.25 },
    { icon: XCircle,       label: "Skipped",            value: dashboard?.skipped_assignments ?? 0,   color: "orange", delay: 0.30 },
  ];

  const currentTabData = assignmentsData?.[activeTab];
  const currentAssignments = currentTabData?.assignments ?? [];
  const currentPagination = currentTabData
    ? {
        total: currentTabData.total,
        total_pages: currentTabData.total_pages,
        has_next: currentTabData.has_next,
        has_previous: currentTabData.has_previous,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || "Student"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your performance overview</p>
      </motion.div>

      <AnimatePresence>
        {activeTaskId && (
          <TaskStatusBanner
            assignmentId={activeTaskId}
            onDismiss={() => setActiveTaskId(null)}
            onCompleted={refreshAssignments}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Performance Trend
              </h3>
              <div className="flex items-center gap-2">
                {PERIODS.map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`h-8 px-3 rounded-md text-sm font-medium capitalize transition-all ${
                      period === p ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <TrendChart trendData={trendData} />
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600 font-medium">Score per assignment</span>
            </div>
          </motion.div>

          {improvementAreas.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Areas to Improve
              </h3>
              <div className="space-y-4">
                {improvementAreas.map((area) => (
                  <div key={area.topic} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-800">{area.topic}</span>
                        <span className="text-lg font-bold text-orange-600">{area.mistake_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${area.mistake_rate}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }} className="h-2 rounded-full bg-orange-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">My Assignments</h3>

            <div className="flex border-b border-gray-200 mb-5">
              {TABS.map((tab) => {
                const count = assignmentsData?.[tab.key]?.total ?? 0;
                const isActive = activeTab === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    // ✅ No setPage(1) needed — each tab already has its own page
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {currentAssignments.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="space-y-2">
                {activeTab === "attempted" && currentAssignments.map((a, i) => (
                  <AttemptedRow key={a.student_assignment_id} assignment={a} index={i} />
                ))}
                {activeTab === "not_attempted" && currentAssignments.map((a, i) => (
                  <NotAttemptedRow key={a.teacher_assignment_id} assignment={a} index={i} onUpload={setUploadTarget} />
                ))}
                {activeTab === "missed" && currentAssignments.map((a, i) => (
                  <MissedRow key={a.teacher_assignment_id} assignment={a} index={i} />
                ))}
              </div>
            )}

            {/* ✅ Pagination now uses per-tab page state */}
            <Pagination
              pagination={currentPagination}
              page={currentPage}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {uploadTarget && (
          <UploadModal
            assignment={uploadTarget}
            onClose={() => setUploadTarget(null)}
            onSuccess={(id) => { setActiveTaskId(id); refreshAssignments(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;