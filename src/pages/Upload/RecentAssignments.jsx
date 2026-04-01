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
  COMPLETED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", border: "border-green-200", label: "Completed" },
  FAILED:    { icon: XCircle,     color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200",   label: "Failed" },
};

const TABS = [
  { label: "All",       value: "" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed",    value: "FAILED" },
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
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>

      <div className="flex-1 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <h4 className="font-medium text-sm text-gray-900 truncate">{assignment.pdf_file_name}</h4>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(assignment.created_at)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                  <CircleDot className="w-2.5 h-2.5" /> {cfg.label}
                </span>
                {assignment.is_reviewed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                    <CheckCircle className="w-2.5 h-2.5" /> Reviewed
                  </span>
                )}
                {assignment.is_published && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
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
              {assignment.status === "FAILED" && (
                <button onClick={() => onRetry(assignment)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Retry
                </button>
              )}
              <button onClick={() => onDelete(assignment)} title="Delete"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {assignment.status === "FAILED" && assignment.error_message && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">{assignment.error_message}</p>
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
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          {i < 3 && <div className="w-0.5 flex-1 bg-gray-100 mt-1" />}
        </div>
        <div className="flex-1 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
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

  // ✅ FIXED: useCallback with correct deps so it always has fresh values
  const fetchAssignments = useCallback(async (pg) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: pg, pageSize: PAGE_SIZE, sortBy: "latest" };
      if (activeTab) params.statusFilter = activeTab;
      const res = await getAssignments(params);
      setAssignments(res.data?.data?.assignments ?? []);
      setPagination(res.data?.data?.pagination ?? null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // ✅ activeTab is the only external dep

  // ✅ FIXED: reset to page 1 when tab or refreshTrigger changes, then fetch
  useEffect(() => {
    setPage(1);
    fetchAssignments(1);
  }, [activeTab, refreshTrigger]); // ✅ refreshTrigger included so new uploads show up

  // ✅ FIXED: fetch when page changes (but only when page > 0)
  useEffect(() => {
    fetchAssignments(page);
  }, [page, fetchAssignments]);

  const handleView = (a) => navigate(`/assignment/${a.assignment_id}`);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(deleteTarget.assignment_id);
      toast.success(`"${deleteTarget.pdf_file_name}" deleted.`);
      setDeleteTarget(null);
      setPage(1);
      fetchAssignments(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = pagination?.total_pages ?? 1;
  const totalCount = pagination?.total_count ?? assignments.length;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Uploads</h2>
          <p className="text-sm text-gray-400 mt-0.5">Track your uploaded assignment status</p>
        </div>
        <button onClick={() => fetchAssignments(page)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors self-start">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex items-center justify-center gap-3 h-32 rounded-xl border border-dashed border-red-200 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-gray-200">
          <FileText className="w-6 h-6 text-gray-300 mb-1.5" />
          <p className="text-gray-400 text-sm">No assignments found</p>
        </div>
      ) : (
        <>
          <div>
            {assignments.map((a, i) => (
              <TimelineItem key={a.assignment_id} assignment={a}
                onView={handleView}
                onRetry={onReupload}
                onDelete={setDeleteTarget}
                isLast={i === assignments.length - 1}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages} · {totalCount} total
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                      }`}>{p}</button>
                  ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete Assignment"
            message={`Are you sure you want to delete "${deleteTarget.pdf_file_name}"? This cannot be undone.`}
            confirmLabel="Delete" confirmStyle="danger"
            isLoading={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default RecentAssignments;