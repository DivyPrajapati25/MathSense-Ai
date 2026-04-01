import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award, Calendar, Eye, ArrowRight, X, Loader, AlertCircle,
  RefreshCw, Pencil, ChevronDown, ChevronUp, CheckCircle,
  Trash2, Send, CalendarClock, CheckCircle2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import useScrollLock from "../../../hooks/useScrollLock";
import StatusBadge from "../../../components/common/StatusBadge/StatusBadge";
import MathText from "../../../components/common/MathText/MathText";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../../components/common/Toast/Toast";
import { formatDate } from "../../../utils/formatDate";
import {
  getAssignments, getAssignmentDetail, updateAssignment,
  deleteAssignment, markReviewed, publishAssignment,
} from "../../../services/teacherService";

const SHOW_LIMIT = 5;
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

/* ─── Edit Assignment Modal ─── */
const EditAssignmentModal = ({ assignment, onClose, onSaved }) => {
  useScrollLock();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [edits, setEdits] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getAssignmentDetail(assignment.id)
      .then((res) => {
        const qs = res.data?.data?.questions ?? [];
        setQuestions(qs);
        const initial = {};
        qs.forEach((q) => {
          initial[q.id] = {
            corrected_final_answer: "",
            difficulty_level: q.Difficulty_Level ?? "Medium",
          };
        });
        setEdits(initial);
        setExpandedId(qs[0]?.id ?? null);
      })
      .catch(() => setError("Failed to load questions."))
      .finally(() => setIsLoading(false));
  }, [assignment.id]);

  const setEdit = (questionId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        corrected_final_answer: edits[q.id]?.corrected_final_answer || null,
        difficulty_level: edits[q.id]?.difficulty_level || q.Difficulty_Level,
      }));
      await updateAssignment(assignment.id, payload);
      toast.success("Assignment updated successfully!");
      onSaved?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.detail;
      toast.error(!err.response ? "Network error." : typeof message === "string" ? message : "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-4 shrink-0 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Edit Assignment</h2>
          <p className="text-sm text-gray-500 mt-1">{assignment.title} — review AI answers and add corrections</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <div className="flex items-center justify-center h-32"><Loader className="w-6 h-6 animate-spin text-blue-600" /></div>}
          {!isLoading && error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {!isLoading && !error && (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{q.question_no}</span>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        <MathText text={q.question_text} />
                      </p>
                    </div>
                    {expandedId === q.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />}
                  </button>
                  {expandedId === q.id && (
                    <div className="p-4 space-y-4 border-t border-gray-100">
                      {/* AI Generated Answer (final_answer) */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">AI Generated Answer <span className="text-gray-400">(read only)</span></label>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-900 whitespace-pre-line">
                          <MathText text={q.final_answer} />
                        </div>
                      </div>
                      {/* Corrected Answer */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Corrected Answer <span className="text-gray-400 font-normal">(fill only if AI answer is wrong)</span></label>
                        <textarea rows={3} placeholder="Enter the correct answer here..."
                          value={edits[q.id]?.corrected_final_answer ?? ""}
                          onChange={(e) => setEdit(q.id, "corrected_final_answer", e.target.value)}
                          className="resize-none w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                      </div>
                      {/* Difficulty Level */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty Level</label>
                        <div className="flex gap-2">
                          {DIFFICULTY_OPTIONS.map((d) => (
                            <button key={d} type="button" onClick={() => setEdit(q.id, "difficulty_level", d)}
                              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                                edits[q.id]?.difficulty_level === d
                                  ? d === "Easy" ? "bg-green-100 border-green-300 text-green-700"
                                  : d === "Medium" ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                                  : "bg-red-100 border-red-300 text-red-700"
                                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}>{d}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Max marks: <strong className="text-gray-600">{q.max_marks}</strong></span>
                        <span>•</span>
                        <span>Topic: <strong className="text-gray-600">{q.topic}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-white shrink-0 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSaving}
            className="h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={isSaving || isLoading}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2">
            {isSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

/* ─── Publish Modal ─── */
const PublishModal = ({ assignment, onClose, onPublished }) => {
  useScrollLock();
  const toast = useToast();
  const [deadline, setDeadline] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!deadline) { toast.error("Please set a deadline."); return; }
    setIsPublishing(true);
    try {
      await publishAssignment(assignment.id, new Date(deadline).toISOString());
      toast.success("Assignment published successfully!");
      onPublished?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Publish Assignment</h3>
            <p className="text-sm text-gray-500">Set a deadline for students to submit.</p>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isPublishing}
            className="h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handlePublish} disabled={isPublishing || !deadline}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2">
            {isPublishing ? <><Loader className="w-4 h-4 animate-spin" /> Publishing...</> : <><Send className="w-4 h-4" /> Publish</>}
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
      </div>
    </>
  );
};

/* ─── View Details Modal (quick info) ─── */
const ViewDetailsModal = ({ assignment, onClose }) => {
  useScrollLock();
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-0">
          <h2 className="text-lg leading-none font-semibold">Assignment Details</h2>
          <p className="text-sm text-gray-500 mt-2">{assignment.title}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
            <p className="text-sm"><span className="font-medium">Status:</span> {assignment.status}</p>
            <p className="text-sm"><span className="font-medium">Created:</span> {assignment.date}</p>
            <p className="text-sm"><span className="font-medium">Reviewed:</span> {assignment.is_reviewed ? "Yes" : "No"}</p>
            {assignment.error_message && (
              <p className="text-sm text-red-600"><span className="font-medium">Error:</span> {assignment.error_message}</p>
            )}
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-white flex justify-end">
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors">Close</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

/* ─── View All Modal ─── */
const ViewAllModal = ({ assignments, onClose, onRetry, onEdit, onDelete }) => {
  useScrollLock();
  const [detailAssignment, setDetailAssignment] = useState(null);
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-[calc(100%-2rem)] sm:max-w-xl max-h-[85vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg leading-none font-semibold">All Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all your assignments</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2 pb-4">
          <div className="space-y-4">
            {assignments.map((a) => (
              <div key={a.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col gap-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-2">{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      <StatusBadge status={a.status} />
                      {a.is_reviewed && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar className="w-4 h-4 mr-1" />{a.date}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {a.status === "FAILED" && (
                      <button onClick={() => { onRetry(a); onClose(); }}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors w-full sm:w-auto">
                        <RefreshCw className="w-4 h-4" /> Retry
                      </button>
                    )}
                    {a.status === "COMPLETED" && (
                      <button onClick={() => { onEdit(a); onClose(); }}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto">
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    )}
                    <button onClick={() => setDetailAssignment(a)}
                      className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors w-full sm:w-auto">
                      <Eye className="w-4 h-4 mr-1" /> View Details
                    </button>
                    <button onClick={() => { onDelete(a); onClose(); }}
                      className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 transition-colors w-full sm:w-auto">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-white shrink-0 flex justify-end">
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors">Close</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      {detailAssignment && <ViewDetailsModal assignment={detailAssignment} onClose={() => setDetailAssignment(null)} />}
    </>
  );
};

/* ─── Single Assignment Card ─── */
const AssignmentCard = ({ assignment, onViewDetails, onRetry, onEdit, onMarkReviewed, onPublish, onDelete }) => {
  const navigate = useNavigate();
  const { title, status, date, is_reviewed } = assignment;
  return (
    <div className={`flex flex-col gap-6 rounded-xl border p-6 bg-white shadow-lg hover:shadow-xl transition-shadow ${
      status === "COMPLETED" ? "border-l-4 border-l-green-500 border-gray-200" :
      status === "FAILED"    ? "border-l-4 border-l-red-500 border-gray-200"   :
      status === "PENDING"   ? "border-l-4 border-l-yellow-400 border-gray-200" :
      "border-gray-200"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-2">{title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
            <StatusBadge status={status} />
            {is_reviewed && (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Calendar className="w-4 h-4 mr-1" />{date}
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-3 flex-wrap">
        {status === "FAILED" && (
          <button onClick={() => onRetry(assignment)}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors focus:outline-none whitespace-nowrap">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        )}
        {status === "PENDING" && (
          <button disabled
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium text-white bg-yellow-400 opacity-70 cursor-not-allowed whitespace-nowrap">
            <Loader className="w-4 h-4 animate-spin" /> Processing...
          </button>
        )}
        {status === "COMPLETED" && (
          <>
            <button onClick={() => onEdit(assignment)}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none whitespace-nowrap">
              <Pencil className="w-4 h-4" /> Edit
            </button>
            {!is_reviewed && (
              <button onClick={() => onMarkReviewed(assignment)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors focus:outline-none whitespace-nowrap">
                <CheckCircle className="w-4 h-4" /> Mark Reviewed
              </button>
            )}
            {is_reviewed && (
              <button onClick={() => onPublish(assignment)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all focus:outline-none whitespace-nowrap">
                <Send className="w-4 h-4" /> Publish
              </button>
            )}
          </>
        )}
        <button
          onClick={() => status === "COMPLETED"
            ? navigate(`/assignment/${assignment.id}`)
            : onViewDetails(assignment)
          }
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none whitespace-nowrap">
          <Eye className="w-4 h-4 shrink-0" /> View Details
        </button>
        <button onClick={() => onDelete(assignment)}
          className="inline-flex items-center justify-center w-11 h-11 rounded-md text-gray-400 border border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main: YourAssignments ─── */
const YourAssignments = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const fetchAssignments = () => {
    setIsLoading(true);
    getAssignments({ page: 1, pageSize: 20, sortBy: "latest" })
      .then((res) => {
        const raw = res.data?.data?.assignments ?? [];
        setAssignments(raw.map((a) => ({
          id: a.assignment_id,
          title: a.pdf_file_name,
          status: a.status,
          date: formatDate(a.created_at),
          error_message: a.error_message,
          is_reviewed: a.is_reviewed ?? false,
        })));
      })
      .catch(() => setApiError("Failed to load assignments. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleRetry = (assignment) => {
    navigate("/upload", { state: { reuploadName: assignment.title } });
  };

  const handleMarkReviewed = async (assignment) => {
    try {
      await markReviewed(assignment.id);
      toast.success(`"${assignment.title}" marked as reviewed.`);
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark reviewed.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleAssignments = assignments.slice(0, SHOW_LIMIT);

  return (
    <section>
      <div className="flex flex-row items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Assignments</h2>
        <button onClick={() => setViewAllOpen(true)}
          className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none whitespace-nowrap w-auto">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading && <div className="flex items-center justify-center h-32"><Loader className="w-6 h-6 animate-spin text-blue-600" /></div>}
      {!isLoading && apiError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{apiError}</span>
        </div>
      )}
      {!isLoading && !apiError && assignments.length === 0 && (
        <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No assignments uploaded yet.</p>
        </div>
      )}
      {!isLoading && !apiError && assignments.length > 0 && (
        <>
          <div className="grid gap-6">
            {visibleAssignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a}
                onViewDetails={setDetailAssignment}
                onRetry={handleRetry}
                onEdit={setEditAssignment}
                onMarkReviewed={handleMarkReviewed}
                onPublish={setPublishTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          {assignments.length > SHOW_LIMIT && (
            <p className="text-sm text-gray-400 text-center mt-4">
              Showing {SHOW_LIMIT} of {assignments.length} assignments.{" "}
              <button onClick={() => setViewAllOpen(true)} className="text-blue-600 hover:underline">View all</button>
            </p>
          )}
        </>
      )}

      {detailAssignment && <ViewDetailsModal assignment={detailAssignment} onClose={() => setDetailAssignment(null)} />}
      {viewAllOpen && <ViewAllModal assignments={assignments} onClose={() => setViewAllOpen(false)} onRetry={handleRetry} onEdit={setEditAssignment} onDelete={setDeleteTarget} />}
      {editAssignment && <EditAssignmentModal assignment={editAssignment} onClose={() => setEditAssignment(null)} onSaved={fetchAssignments} />}

      <AnimatePresence>
        {publishTarget && (
          <PublishModal assignment={publishTarget} onClose={() => setPublishTarget(null)} onPublished={fetchAssignments} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete Assignment"
            message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            confirmStyle="danger"
            isLoading={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default YourAssignments;