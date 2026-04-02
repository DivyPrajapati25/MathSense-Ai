import { motion } from "framer-motion";
import {
  FileText, Clock, Eye, Loader, ChevronLeft, ChevronRight,
  Trash2, CheckCircle, Send, Pencil, BookOpen, ClipboardCheck,
  GraduationCap, Lock,
} from "lucide-react";
import { cardVariants } from "../../utils/animations";
import StatusBadge from "../../components/common/StatusBadge/StatusBadge";
import { formatDate } from "../../utils/formatDate";

/* ─── Stat Card ─── */
export const StatCard = ({ icon: Icon, label, value, color }) => {
  const palette = {
    blue:  { bg: "bg-blue-50 dark:bg-blue-900/20",  icon: "text-blue-600 dark:text-blue-400",  val: "text-blue-700 dark:text-blue-300"  },
    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-500 dark:text-amber-400", val: "text-amber-600 dark:text-amber-300" },
    green: { bg: "bg-green-50 dark:bg-green-900/20", icon: "text-green-600 dark:text-green-400", val: "text-green-700 dark:text-green-300" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-600 dark:text-indigo-400", val: "text-indigo-700 dark:text-indigo-300" },
  };
  const c = palette[color] ?? palette.blue;
  return (
    <motion.div variants={cardVariants}
      className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4 sm:p-5 hover:shadow-sm transition-shadow">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${c.bg} flex items-center justify-center mb-2 sm:mb-3`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${c.icon}`} />
      </div>
      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-0.5 sm:mb-1 truncate">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${c.val}`}>{value}</p>
    </motion.div>
  );
};

/* ─── Class Filter Card ─── */
export const ClassCard = ({ standard, isSelected, assignmentCount, onClick }) => (
  <button onClick={onClick}
    className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm ${
      isSelected
        ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-100 dark:ring-blue-900/40"
        : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-blue-200 dark:hover:border-blue-700"
    }`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : "bg-[var(--color-bg-secondary)]"}`}>
        <GraduationCap className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-[var(--color-text-secondary)]"}`} />
      </div>
      {isSelected && (
        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">Active</span>
      )}
    </div>
    <p className={`text-base font-bold mb-1 ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-[var(--color-text-primary)]"}`}>
      Class {standard.standard}
    </p>
    <p className="text-xs text-[var(--color-text-muted)]">{assignmentCount} assignment{assignmentCount !== 1 ? "s" : ""}</p>
  </button>
);

/* ─── Class Section Skeleton ─── */
export const ClassSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 animate-pulse">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-tertiary)] mb-3" />
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-2/3 mb-2" />
        <div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-1/2" />
      </div>
    ))}
  </div>
);

/* ─── Assignment Row ─── */
export const AssignmentRow = ({ assignment, allStandards, onView, onEdit, onReview, onPublish, onDelete }) => {
  const statusBorder =
    assignment.status === "COMPLETED" ? "border-l-green-500" :
    assignment.status === "FAILED"    ? "border-l-red-500"   :
    assignment.status === "PENDING"   ? "border-l-amber-400" : "";

  const classInfo = allStandards.find((s) => s.id === assignment.standard_id);
  const isPublished = assignment.is_published === true;
  const canEdit    = assignment.status === "COMPLETED" && !assignment.is_reviewed && !isPublished;
  const canReview  = assignment.status === "COMPLETED" && !assignment.is_reviewed;
  const canPublish = assignment.is_reviewed && !isPublished;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] border-l-4 ${statusBorder} rounded-xl px-4 py-3.5 hover:shadow-sm transition-all group`}>
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-[var(--color-text-primary)] truncate">{assignment.pdf_file_name}</h4>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 min-w-[120px]">
              <Clock className="w-3 h-3" /> {formatDate(assignment.created_at)}
            </span>
            {classInfo && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-1.5 py-0.5 rounded font-medium">
                <GraduationCap className="w-3 h-3" /> Class {classInfo.standard}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Badges + Actions — stack on mobile */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0 pl-12 sm:pl-0">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={assignment.status} />
          {isPublished ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              <Send className="w-3 h-3" /> Published
            </span>
          ) : assignment.is_reviewed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle className="w-3 h-3" /> Reviewed
            </span>
          ) : assignment.status === "COMPLETED" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 text-xs font-medium">
              Pending Review
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
          {assignment.status === "COMPLETED" && (
            <button onClick={() => onView(assignment)} title="View"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          )}
          {canEdit && (
            <button onClick={() => onEdit(assignment)} title="Edit answers"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {assignment.is_reviewed && (
            <span title="Editing locked after review"
              className="inline-flex items-center justify-center w-8 h-8 text-[var(--color-text-muted)] cursor-default">
              <Lock className="w-4 h-4" />
            </span>
          )}
          {canReview && (
            <button onClick={() => onReview(assignment)} title="Mark as Reviewed"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </button>
          )}
          {canPublish && (
            <button onClick={() => onPublish(assignment)} title="Publish to students"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          )}
          {isPublished && (
            <span title="Published — deadline is locked"
              className="inline-flex items-center justify-center w-8 h-8 text-indigo-300 dark:text-indigo-600 cursor-default">
              <Lock className="w-4 h-4" />
            </span>
          )}
          {assignment.status === "FAILED" && (
            <span className="text-xs text-red-500 font-medium px-2">Failed</span>
          )}
          {assignment.status === "PENDING" && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium px-2">
              <Loader className="w-3 h-3 animate-spin" /> Processing
            </span>
          )}
          <button onClick={() => onDelete(assignment)} title="Delete"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors sm:opacity-0 sm:group-hover:opacity-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Pagination ─── */
export const Pagination = ({ page, totalPages, totalCount, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--color-border)]">
      <p className="text-xs text-[var(--color-text-muted)]">
        Page <span className="font-medium text-[var(--color-text-secondary)]">{page}</span> of {totalPages} · {totalCount} assignments
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
          .map((p) => (
            <button key={p} onClick={() => onPageChange(p)}
              className={`hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}>
              {p}
            </button>
          ))}
        <span className="sm:hidden text-xs font-medium text-[var(--color-text-secondary)] px-2">{page}/{totalPages}</span>
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Loading Skeleton ─── */
export const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--color-bg-tertiary)] rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-1/3" />
            <div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-1/4" />
          </div>
          <div className="h-6 bg-[var(--color-bg-tertiary)] rounded-md w-20" />
        </div>
      </div>
    ))}
  </div>
);
