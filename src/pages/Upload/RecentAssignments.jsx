import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, Eye, Loader, AlertCircle, RefreshCw, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

const PAGE_SIZE = 5;

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:    "bg-yellow-100 border-yellow-200 text-yellow-700",
    PROCESSING: "bg-blue-100 border-blue-200 text-blue-700",
    COMPLETED:  "bg-green-100 border-green-200 text-green-700",
    FAILED:     "bg-red-100 border-red-200 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium whitespace-nowrap ${styles[status] ?? "bg-gray-100 border-gray-200 text-gray-600"}`}>
      {status}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const AssignmentRow = ({ assignment, onReupload, onViewDetails }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border rounded-xl px-4 py-3 hover:shadow-sm transition-shadow ${
    assignment.status === "COMPLETED" ? "border-l-4 border-l-green-500 border-gray-200" :
    assignment.status === "FAILED"    ? "border-l-4 border-l-red-500 border-gray-200"   :
    assignment.status === "PENDING"   ? "border-l-4 border-l-yellow-400 border-gray-200" :
    "border-gray-200"
  }`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-base text-gray-900 truncate">{assignment.pdf_file_name}</h4>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5 flex-wrap">
          <span>Total Marks: {assignment.total_marks}</span>
          <span className="flex items-center gap-1 ml-1">
            <Clock className="w-3 h-3" />
            {formatDate(assignment.created_at)}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3 shrink-0 sm:ml-4">
      <StatusBadge status={assignment.status} />
      {assignment.status === "COMPLETED" && (
        <button onClick={() => onViewDetails(assignment)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap">
          <Eye className="w-4 h-4" /> View Details
        </button>
      )}
      {/* ✅ CHANGED: Re-upload for FAILED — opens create modal with name prefilled */}
      {assignment.status === "FAILED" && (
        <button onClick={() => onReupload(assignment)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors whitespace-nowrap">
          <Upload className="w-4 h-4" /> Retry
        </button>
      )}
      {assignment.status === "PENDING" && (
        <button disabled
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-yellow-400 text-white text-sm font-medium opacity-70 cursor-not-allowed whitespace-nowrap">
          <Loader className="w-4 h-4 animate-spin" /> Processing
        </button>
      )}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="grid gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ✅ CHANGED: accepts onReupload prop from UploadPage
const RecentAssignments = ({ refreshTrigger, onReupload }) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/teacher/assignments/");
      setAssignments(res.data?.data?.assignments ?? []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [refreshTrigger]);

  const handleViewDetails = (assignment) => {
    navigate(`/assignment/${assignment.assignment_id}`);
  };

  const totalPages = Math.ceil(assignments.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginatedAssignments = assignments.slice(start, start + PAGE_SIZE);

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Recent Assignments</h2>
        <button onClick={fetchAssignments}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex items-center justify-center gap-3 h-32 rounded-xl border border-dashed border-red-200 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No assignments created yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paginatedAssignments.map((a) => (
              <AssignmentRow
                key={a.assignment_id}
                assignment={a}
                onReupload={onReupload} // ✅ passed from UploadPage
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, assignments.length)} of {assignments.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default RecentAssignments;