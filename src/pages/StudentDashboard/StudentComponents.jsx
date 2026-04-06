import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle, XCircle, Upload, FileText, Loader,
  ChevronRight, ChevronLeft, CalendarClock, Award,
  BarChart2, Zap, Trophy,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast/Toast";

/* ─── Score Badge ─── */
export const ScoreBadge = ({ percentage }) => {
  const cls =
    percentage >= 80 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
    : percentage >= 50 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
      {percentage}%
    </span>
  );
};

/* ─── Stat Card (with hover animations + click) ─── */
export const StatCard = ({ icon: Icon, label, value, color, delay = 0, onClick }) => {
  const palette = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",   icon: "text-blue-600 dark:text-blue-400",   val: "text-blue-700 dark:text-blue-300",   glow: "hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30",   ring: "hover:ring-blue-200 dark:hover:ring-blue-800"   },
    green:  { bg: "bg-green-50 dark:bg-green-900/20",  icon: "text-green-600 dark:text-green-400",  val: "text-green-700 dark:text-green-300",  glow: "hover:shadow-green-200/50 dark:hover:shadow-green-900/30",  ring: "hover:ring-green-200 dark:hover:ring-green-800"  },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-600 dark:text-purple-400", val: "text-purple-700 dark:text-purple-300", glow: "hover:shadow-purple-200/50 dark:hover:shadow-purple-900/30", ring: "hover:ring-purple-200 dark:hover:ring-purple-800" },
    orange: { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-500 dark:text-orange-400", val: "text-orange-600 dark:text-orange-300", glow: "hover:shadow-orange-200/50 dark:hover:shadow-orange-900/30", ring: "hover:ring-orange-200 dark:hover:ring-orange-800" },
    red:    { bg: "bg-red-50 dark:bg-red-900/20",    icon: "text-red-500 dark:text-red-400",    val: "text-red-600 dark:text-red-300",    glow: "hover:shadow-red-200/50 dark:hover:shadow-red-900/30",    ring: "hover:ring-red-200 dark:hover:ring-red-800"    },
  };
  const c = palette[color] ?? palette.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 transition-all duration-300 group
        hover:shadow-lg ${c.glow} hover:ring-1 ${c.ring} hover:border-transparent ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${c.icon} transition-transform duration-300 group-hover:rotate-[-8deg]`} />
        </div>
        {onClick && (
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1 flex items-center gap-0.5">
            View <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
    </motion.div>
  );
};

/* ─── Chart helpers ─── */
const formatChartDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatChartDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ─── Chart Tooltip ─── */
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl p-3.5 text-sm min-w-[180px]">
      <p className="font-semibold text-[var(--color-text-primary)] mb-1 truncate max-w-[200px]">{data?.name}</p>
      <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs mb-2">
        <CalendarClock className="w-3 h-3" />
        <span>{data?.dateFormatted || "-"}</span>
      </div>
      <div className="flex items-center gap-2 pt-1.5 border-t border-[var(--color-border)]">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        <span className="text-blue-600 dark:text-blue-400 font-bold text-base">{payload[0]?.value}%</span>
        <span className="text-[var(--color-text-muted)] text-xs">Score</span>
      </div>
    </div>
  );
};

/* ─── Trend Chart (with date X-axis) ─── */
export const TrendChart = ({ trendData }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const chartData = trendData.map((t) => ({
    name: t.assignment_name,
    date: formatChartDate(t.created_at),
    dateFormatted: formatChartDateTime(t.created_at),
    value: t.score ?? 0,
  }));

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-[var(--color-text-muted)] text-sm gap-2">
        <BarChart2 className="w-8 h-8 text-[var(--color-bg-tertiary)]" />
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }} />
            <Area type="monotone" dataKey="value" name="Score"
              stroke="#3B82F6" strokeWidth={3} fill="url(#studentGrad)"
              dot={{ r: 4, fill: "#3B82F6", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#3B82F6", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
              isAnimationActive animationDuration={1200} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

/* ─── Attempted Row ─── */
export const AttemptedRow = ({ assignment, index, isProcessing = false }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const pct = (!isProcessing && assignment.total_marks > 0)
    ? Math.round((assignment.total_rewarded_marks / assignment.total_marks) * 100)
    : 0;

  const handleClick = () => {
    if (isProcessing) {
      toast.warning("This assignment is currently being processed by our AI. Please click Refresh to check again in a few minutes.");
      return;
    }
    navigate(`/student/assignment/${assignment.student_assignment_id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, x: 2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      onClick={handleClick}
      className="group flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-bg-card)] hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 border border-transparent transition-all duration-300 cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
        isProcessing
          ? "bg-amber-100 dark:bg-amber-900/20"
          : "bg-green-100 dark:bg-green-900/20"
      }`}>
        {isProcessing
          ? <Loader className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-spin" />
          : <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-[var(--color-text-primary)] truncate">{assignment.assignment_name}</h4>
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] mt-0.5 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(assignment.submitted_on)}
          </span>
          {isProcessing ? (
            <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">AI is evaluating...</span>
          ) : (
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-blue-400" />
              <strong className="text-[var(--color-text-primary)]">{assignment.total_rewarded_marks}</strong>/{assignment.total_marks} marks
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isProcessing ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Loader className="w-3 h-3 animate-spin" /> Processing...
          </span>
        ) : (
          <>
            <ScoreBadge percentage={pct} />
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-blue-400 transition-colors" />
          </>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Not Attempted Row ─── */
export const NotAttemptedRow = ({ assignment, onUpload, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    whileHover={{ y: -2, x: 2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
    className="group flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-card)] hover:shadow-md transition-all duration-300"
  >
    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-[var(--color-text-primary)] truncate">{assignment.assignment_name}</h4>
      <p className="text-sm text-orange-500 dark:text-orange-400 flex items-center gap-1 mt-0.5">
        <CalendarClock className="w-3 h-3" /> Due {formatDate(assignment.deadline)}
      </p>
    </div>
    <button onClick={() => onUpload(assignment)}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0">
      <Upload className="w-4 h-4" /> Upload
    </button>
  </motion.div>
);

/* ─── Missed Row ─── */
export const MissedRow = ({ assignment, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
    className="group flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg opacity-70 hover:opacity-90 transition-all duration-300"
  >
    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
      <XCircle className="w-5 h-5 text-red-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-[var(--color-text-primary)] truncate">{assignment.assignment_name}</h4>
      <p className="text-sm text-red-400 flex items-center gap-1 mt-0.5">
        <CalendarClock className="w-3 h-3" /> Deadline passed: {formatDate(assignment.deadline)}
      </p>
    </div>
    <span className="text-xs font-medium text-red-500 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md shrink-0">Missed</span>
  </motion.div>
);

/* ─── Empty State ─── */
export const EmptyState = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-[var(--color-border)]">
    <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
      {tab === "not_attempted" ? <Zap className="w-5 h-5 text-[var(--color-text-muted)]" />
      : tab === "attempted" ? <Trophy className="w-5 h-5 text-[var(--color-text-muted)]" />
      : <CheckCircle className="w-5 h-5 text-[var(--color-text-muted)]" />}
    </div>
    <p className="text-[var(--color-text-muted)] text-sm">
      {tab === "not_attempted" ? "No pending assignments — you're all caught up!"
      : tab === "attempted" ? "No submissions yet."
      : "No missed assignments. Great job!"}
    </p>
  </div>
);

/* ─── Pagination ─── */
export const StudentPagination = ({ pagination, page, onPageChange }) => {
  if (!pagination || pagination.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Page {page} of {pagination.total_pages} ({pagination.total} total)
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!pagination.has_previous}
          className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-[var(--color-text-secondary)] font-medium">{page} / {pagination.total_pages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.has_next}
          className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
