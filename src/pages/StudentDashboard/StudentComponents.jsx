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

/* ─── Stat Card ─── */
export const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => {
  const palette = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",   icon: "text-blue-600 dark:text-blue-400",   val: "text-blue-700 dark:text-blue-300"   },
    green:  { bg: "bg-green-50 dark:bg-green-900/20",  icon: "text-green-600 dark:text-green-400",  val: "text-green-700 dark:text-green-300"  },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-600 dark:text-purple-400", val: "text-purple-700 dark:text-purple-300" },
    orange: { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-500 dark:text-orange-400", val: "text-orange-600 dark:text-orange-300" },
    red:    { bg: "bg-red-50 dark:bg-red-900/20",    icon: "text-red-500 dark:text-red-400",    val: "text-red-600 dark:text-red-300"    },
  };
  const c = palette[color] ?? palette.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-sm transition-shadow"
    >
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
    </motion.div>
  );
};

/* ─── Chart Tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-[var(--color-text-primary)] mb-1 truncate max-w-[160px]">{label}</p>
      <p className="text-blue-600 dark:text-blue-400 font-semibold">Score: {payload[0]?.value}%</p>
    </div>
  );
};

/* ─── Trend Chart ─── */
export const TrendChart = ({ trendData }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const chartData = trendData.map((t) => ({ label: t.assignment_name, value: t.score ?? 0 }));

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
            <XAxis dataKey="label" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
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
      onClick={handleClick}
      className="group flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-bg-card)] hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-700 border border-transparent transition-all cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
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
    className="flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-all"
  >
    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
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
    className="flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg opacity-60"
  >
    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center shrink-0">
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
