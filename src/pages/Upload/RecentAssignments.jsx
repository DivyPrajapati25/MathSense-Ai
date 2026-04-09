import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Clock, Eye, Loader, AlertCircle, RefreshCw, Upload,
  ChevronLeft, ChevronRight, Trash2, CheckCircle, Send,
  CircleDot, XCircle,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../components/common/Toast/Toast";
import { getAssignments, deleteAssignment } from "../../services/teacherService";

const PAGE_SIZE = 5;

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle, color: "text-green-500 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", label: "Created" },
  FAILED: { icon: XCircle, color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", label: "Failed" },
};

const TABS = [
  { label: "All", value: "" },
  { label: "Created", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

const TimelineItem = ({ assignment, onView, onRetry, onDelete, isLast }) => {
  const cfg = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.FAILED;
  const StatusIcon = cfg.icon;

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full ${cfg.bg} ${cfg.border} border-2 flex items-center justify-center z-10`}>
          <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-[var(--color-border)] mt-1" />}
      </div>

      <div className="flex-1 pb-6">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                <h4 className="font-medium text-sm text-[var(--color-text-primary)] truncate">{assignment.pdf_file_name}</h4>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(assignment.created_at)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                  <CircleDot className="w-2.5 h-2.5" /> {cfg.label}
                </span>
                {assignment.is_reviewed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <CheckCircle className="w-2.5 h-2.5" /> Reviewed
                  </span>
                )}
                {assignment.is_published && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    <Send className="w-2.5 h-2.5" /> Published
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {assignment.status === "COMPLETED" && (
                <button onClick={() => onView(assignment)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              )}
              {/* {assignment.status === "FAILED" && (
                <button onClick={() => onRetry(assignment)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Retry
                </button>
              )} */}
              <button onClick={() => onDelete(assignment)} title="Delete"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {assignment.status === "FAILED" && (
            <div className="mt-2 text-xs text-red-400">
              Something went wrong
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-0">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] animate-pulse" />
          {i < 3 && <div className="w-0.5 flex-1 bg-[var(--color-border)] mt-1" />}
        </div>
        <div className="flex-1 pb-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-1/3 mb-2" />
            <div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-1/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecentAssignments = ({ refreshTrigger, onReupload }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssignments = useCallback(async (pg) => {
    setLoading(true); setError("");
    try {
      const params = { page: pg, pageSize: PAGE_SIZE, sortBy: "latest" };
      if (activeTab) params.statusFilter = activeTab;
      const res = await getAssignments(params);
      setAssignments(res.data?.data?.assignments ?? []);
      setPagination(res.data?.data?.pagination ?? null);
    } catch (err) { setError(err.response?.data?.message || "Failed to load."); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { setPage(1); fetchAssignments(1); }, [activeTab, refreshTrigger]);
  useEffect(() => { fetchAssignments(page); }, [page, fetchAssignments]);

  const handleView = (a) => navigate(`/assignment/${a.assignment_id}`);
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(deleteTarget.assignment_id);
      toast.success(`"${deleteTarget.pdf_file_name}" deleted.`);
      setDeleteTarget(null); setPage(1); fetchAssignments(1);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete."); }
    finally { setIsDeleting(false); }
  };

  const totalPages = pagination?.total_pages ?? 1;
  const totalCount = pagination?.total_count ?? assignments.length;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Uploads</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Track your uploaded assignment status</p>
        </div>
        <button onClick={() => fetchAssignments(page)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors self-start">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-5 p-1 bg-[var(--color-bg-secondary)] rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${activeTab === tab.value
                ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton />
        : error ? (
          <div className="flex items-center justify-center gap-3 h-32 rounded-xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-[var(--color-border)]">
            <FileText className="w-6 h-6 text-[var(--color-text-muted)] mb-1.5" />
            <p className="text-[var(--color-text-muted)] text-sm">No assignments found</p>
          </div>
        ) : (
          <>
            <div>
              {assignments.map((a, i) => (
                <TimelineItem key={a.assignment_id} assignment={a} onView={handleView} onRetry={onReupload} onDelete={setDeleteTarget} isLast={i === assignments.length - 1} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)]">Page {page} of {totalPages} · {totalCount} total</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                        }`}>{p}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog title="Delete Assignment"
            message={`Are you sure you want to delete "${deleteTarget.pdf_file_name}"? This cannot be undone.`}
            confirmLabel="Delete" confirmStyle="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default RecentAssignments;