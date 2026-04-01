import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Clock, Eye, Loader, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, Trash2, Filter, CheckCircle,
  Send, Pencil, BookOpen, ClipboardCheck, Upload,
  X, ChevronDown, ChevronUp, RotateCcw, Copy,
  GraduationCap, Lock, CalendarCheck,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { sectionVariants, staggerContainer, cardVariants } from "../../utils/animations";
import StatusBadge from "../../components/common/StatusBadge/StatusBadge";
import MathText from "../../components/common/MathText/MathText";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../components/common/Toast/Toast";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import useScrollLock from "../../hooks/useScrollLock";
import api from "../../services/api";
import {
  getAssignments, getAssignmentDetail, updateAssignment,
  deleteAssignment, markReviewed, publishAssignment,
} from "../../services/teacherService";

const PAGE_SIZE = 8;
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Completed",  value: "COMPLETED" },
  { label: "Pending",    value: "PENDING" },
  { label: "Failed",     value: "FAILED" },
];
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

/* ─── Helper: get current datetime-local string for min attribute ─── */
const getNowLocalMin = () => {
  const now = new Date();
  // Offset by 5 minutes to give a small buffer
  now.setMinutes(now.getMinutes() + 5);
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, color }) => {
  const palette = {
    blue:  { bg: "bg-blue-50",  icon: "text-blue-600",  val: "text-blue-700"  },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", val: "text-amber-600" },
    green: { bg: "bg-green-50", icon: "text-green-600", val: "text-green-700" },
  };
  const c = palette[color] ?? palette.blue;
  return (
    <motion.div variants={cardVariants}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
    </motion.div>
  );
};

/* ─── Class Filter Card ─── */
const ClassCard = ({ standard, isSelected, assignmentCount, onClick }) => (
  <button onClick={onClick}
    className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm ${
      isSelected
        ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
        : "border-gray-200 bg-white hover:border-blue-200"
    }`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}>
        <GraduationCap className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
      </div>
      {isSelected && (
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Active</span>
      )}
    </div>
    <p className={`text-base font-bold mb-1 ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
      Class {standard.standard}
    </p>
    <p className="text-xs text-gray-400">{assignmentCount} assignment{assignmentCount !== 1 ? "s" : ""}</p>
  </button>
);

/* ─── Class Section Skeleton ─── */
const ClassSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
        <div className="w-9 h-9 rounded-lg bg-gray-200 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    ))}
  </div>
);

/* ─── Review Confirm Dialog ─── */
const ReviewConfirmDialog = ({ assignmentName, onConfirm, onCancel, isLoading }) => (
  /* Full-screen fixed overlay — z-50 ensures it sits above everything */
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop — covers entire viewport including scrolled content */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Mark as Reviewed?</h3>
          <p className="text-sm text-gray-500">
            You're about to mark <span className="font-medium text-gray-700">"{assignmentName}"</span> as reviewed.
          </p>
        </div>
      </div>
      <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 font-medium">
          Once marked as reviewed, you will <span className="underline">not be able to edit</span> this assignment. Make sure all answers and difficulty levels are correct before proceeding.
        </p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} disabled={isLoading}
          className="h-9 px-4 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isLoading}
          className="h-9 px-5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-2 transition-colors">
          {isLoading
            ? <><Loader className="w-4 h-4 animate-spin" /> Marking...</>
            : <><ClipboardCheck className="w-4 h-4" /> Yes, Mark Reviewed</>
          }
        </button>
      </div>
    </div>
  </div>
);

/* ─── Publish Modal ─── */
const PublishModal = ({ assignmentId, assignmentName, onClose, onPublished }) => {
  useScrollLock();
  const toast = useToast();
  const [deadline, setDeadline] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  // Compute min once on mount — 5 min from now, never stale during the session
  const [minDateTime] = useState(getNowLocalMin);

  const handlePublish = async () => {
    if (!deadline) {
      toast.error("Please set a deadline.");
      return;
    }
    // Double-check: selected date must be in the future
    if (new Date(deadline) <= new Date()) {
      toast.error("Deadline must be a future date and time.");
      return;
    }
    setIsPublishing(true);
    try {
      await publishAssignment(assignmentId, new Date(deadline).toISOString());
      toast.success("Assignment published successfully!");
      onPublished?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish.");
    } finally { setIsPublishing(false); }
  };

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    /* Full-screen fixed overlay — same pattern as ReviewConfirmDialog */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop covers full viewport */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-0.5">Publish Assignment</h3>
              <p className="text-sm text-gray-400 truncate max-w-[220px]">"{assignmentName}"</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deadline input — min prevents past dates */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Set Submission Deadline <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={deadline}
            min={minDateTime}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Only future dates are allowed
          </p>
        </div>

        {/* Live preview of selected date */}
        {formattedDeadline && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <p className="text-sm text-indigo-700">
              Students must submit by <strong>{formattedDeadline}</strong>
            </p>
          </div>
        )}

        {/* Lock warning */}
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">
            Once published, the deadline <span className="underline">cannot be changed</span>. Students will be notified and will see this date immediately.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isPublishing}
            className="flex-1 h-10 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handlePublish} disabled={isPublishing || !deadline}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-colors">
            {isPublishing
              ? <><Loader className="w-4 h-4 animate-spin" /> Publishing...</>
              : <><Send className="w-4 h-4" /> Publish Now</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Assignment Modal ─── */
const EditAssignmentModal = ({ assignmentId, onClose, onSaved }) => {
  useScrollLock();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [edits, setEdits] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingIds, setEditingIds] = useState(new Set());

  useEffect(() => {
    getAssignmentDetail(assignmentId)
      .then((res) => {
        const qs = res.data?.data?.questions ?? [];
        setQuestions(qs);
        const initial = {};
        qs.forEach((q) => {
          initial[q.id] = { corrected_final_answer: "", difficulty_level: q.Difficulty_Level ?? "Medium" };
        });
        setEdits(initial);
        setExpandedId(qs[0]?.id ?? null);
      })
      .catch(() => setError("Failed to load questions."))
      .finally(() => setIsLoading(false));
  }, [assignmentId]);

  const setEdit = (qid, field, value) =>
    setEdits((p) => ({ ...p, [qid]: { ...p[qid], [field]: value } }));

  const handleEditAnswer = (q) => {
    setEditingIds((prev) => new Set([...prev, q.id]));
    if (!edits[q.id]?.corrected_final_answer)
      setEdit(q.id, "corrected_final_answer", q.final_answer ?? "");
  };
  const handleCancelEdit = (qid) => {
    setEditingIds((prev) => { const n = new Set(prev); n.delete(qid); return n; });
    setEdit(qid, "corrected_final_answer", "");
  };
  const handleSave = async () => {
    setIsSaving(true); setError("");
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        corrected_final_answer: edits[q.id]?.corrected_final_answer || null,
        difficulty_level: edits[q.id]?.difficulty_level || q.Difficulty_Level,
      }));
      await updateAssignment(assignmentId, payload);
      toast.success("Assignment updated!");
      onSaved?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Failed to save.");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Assignment</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Click <span className="font-medium text-blue-600">"Edit Answer"</span> on any question to correct it
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
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
              {questions.map((q) => {
                const isExpanded = expandedId === q.id;
                const isEditing = editingIds.has(q.id);
                return (
                  <div key={q.id} className={`border rounded-xl overflow-hidden transition-colors ${isEditing ? "border-blue-300" : "border-gray-200"}`}>
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isEditing ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                          {q.question_no}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate"><MathText text={q.question_text} /></p>
                          {isEditing && <span className="text-xs text-blue-600 font-medium">✏️ Editing...</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                          (edits[q.id]?.difficulty_level || q.Difficulty_Level) === "Easy" ? "bg-green-100 border-green-200 text-green-700"
                          : (edits[q.id]?.difficulty_level || q.Difficulty_Level) === "Hard" ? "bg-red-100 border-red-200 text-red-700"
                          : "bg-yellow-100 border-yellow-200 text-yellow-700"
                        }`}>{edits[q.id]?.difficulty_level || q.Difficulty_Level}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-4 space-y-4 border-t border-gray-100">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-500">AI Generated Answer <span className="text-gray-400">(read only)</span></label>
                            {!isEditing
                              ? <button type="button" onClick={() => handleEditAnswer(q)} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"><Copy className="w-3 h-3" /> Edit Answer</button>
                              : <button type="button" onClick={() => handleCancelEdit(q.id)} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"><X className="w-3 h-3" /> Cancel Edit</button>
                            }
                          </div>
                          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-900 whitespace-pre-line">
                            <MathText text={q.final_answer} />
                          </div>
                        </div>
                        {isEditing && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Corrected Answer <span className="text-gray-400 font-normal ml-1">(edit below)</span>
                            </label>
                            <textarea rows={8} value={edits[q.id]?.corrected_final_answer ?? ""}
                              onChange={(e) => setEdit(q.id, "corrected_final_answer", e.target.value)}
                              className="resize-y w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono" />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty Level</label>
                          <div className="flex gap-2">
                            {DIFFICULTY_OPTIONS.map((d) => (
                              <button key={d} type="button" onClick={() => setEdit(q.id, "difficulty_level", d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  (edits[q.id]?.difficulty_level ?? q.Difficulty_Level) === d
                                    ? d === "Easy" ? "bg-green-100 border-green-300 text-green-700" : d === "Medium" ? "bg-yellow-100 border-yellow-300 text-yellow-700" : "bg-red-100 border-red-300 text-red-700"
                                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}>{d}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 border-t border-gray-100">
                          <span>Max marks: <strong className="text-gray-600">{q.max_marks}</strong></span>
                          <span>·</span>
                          <span>Topic: <strong className="text-gray-600">{q.topic}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          {editingIds.size > 0
            ? <span className="text-xs text-blue-600 font-medium">✏️ {editingIds.size} question{editingIds.size > 1 ? "s" : ""} edited</span>
            : <span className="text-xs text-gray-400">Click "Edit Answer" on any question to start</span>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isSaving} className="h-10 px-5 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={isSaving || isLoading} className="h-10 px-5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
              {isSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Assignment Row ─── */
const AssignmentRow = ({ assignment, allStandards, onView, onEdit, onReview, onPublish, onDelete }) => {
  const statusBorder =
    assignment.status === "COMPLETED" ? "border-l-green-500" :
    assignment.status === "FAILED"    ? "border-l-red-500"   :
    assignment.status === "PENDING"   ? "border-l-amber-400" : "";

  const classInfo = allStandards.find((s) => s.id === assignment.standard_id);

  // Explicit publish check — treat missing field as false
  const isPublished = assignment.is_published === true;
  const canEdit    = assignment.status === "COMPLETED" && !assignment.is_reviewed && !isPublished;
  const canReview  = assignment.status === "COMPLETED" && !assignment.is_reviewed;
  const canPublish = assignment.is_reviewed && !isPublished;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 border-l-4 ${statusBorder} rounded-xl px-4 py-3.5 hover:shadow-sm transition-all group`}>
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{assignment.pdf_file_name}</h4>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(assignment.created_at)}
            </span>
            {classInfo && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-medium">
                <GraduationCap className="w-3 h-3" /> Class {classInfo.standard}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <StatusBadge status={assignment.status} />
        {isPublished ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
            <Send className="w-3 h-3" /> Published
          </span>
        ) : assignment.is_reviewed ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Reviewed
          </span>
        ) : assignment.status === "COMPLETED" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium">
            Pending Review
          </span>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* View */}
        {assignment.status === "COMPLETED" && (
          <button onClick={() => onView(assignment)} title="View"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Edit — only before reviewed */}
        {canEdit && (
          <button onClick={() => onEdit(assignment)} title="Edit answers"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {/* Edit locked — after reviewed */}
        {assignment.is_reviewed && (
          <span title="Editing locked after review"
            className="inline-flex items-center justify-center w-8 h-8 text-gray-300 cursor-default">
            <Lock className="w-4 h-4" />
          </span>
        )}

        {/* Mark Reviewed */}
        {canReview && (
          <button onClick={() => onReview(assignment)} title="Mark as Reviewed"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
            <ClipboardCheck className="w-4 h-4" />
          </button>
        )}

        {/* Publish */}
        {canPublish && (
          <button onClick={() => onPublish(assignment)} title="Publish to students"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        )}

        {/* Publish locked */}
        {isPublished && (
          <span title="Published — deadline is locked"
            className="inline-flex items-center justify-center w-8 h-8 text-indigo-300 cursor-default">
            <Lock className="w-4 h-4" />
          </span>
        )}

        {assignment.status === "FAILED" && (
          <span className="text-xs text-red-500 font-medium px-2">Failed</span>
        )}
        {assignment.status === "PENDING" && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium px-2">
            <Loader className="w-3 h-3 animate-spin" /> Processing
          </span>
        )}

        {/* Delete */}
        <button onClick={() => onDelete(assignment)} title="Delete"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Pagination ─── */
const Pagination = ({ page, totalPages, totalCount, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Page <span className="font-medium text-gray-600">{page}</span> of {totalPages} · {totalCount} assignments
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
          .map((p) => (
            <button key={p} onClick={() => onPageChange(p)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
              {p}
            </button>
          ))}
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Loading Skeleton ─── */
const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-6 bg-gray-200 rounded-md w-20" />
        </div>
      </div>
    ))}
  </div>
);

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/* ═══ Main Dashboard ═══ */
const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [allStandards, setAllStandards] = useState([]);
  const [standardsLoading, setStandardsLoading] = useState(true);
  const [classCounts, setClassCounts] = useState({});
  const [selectedStandardId, setSelectedStandardId] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [isReviewedFilter, setIsReviewedFilter] = useState("");
  const [isPublishedFilter, setIsPublishedFilter] = useState("");
  const [statCounts, setStatCounts] = useState({ total: 0, reviewed: 0, pending: 0 });

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [reviewTarget, setReviewTarget]   = useState(null);
  const [isReviewing, setIsReviewing]     = useState(false);

  useEffect(() => {
    api.get("/student/standards")
      .then((res) => setAllStandards(res.data?.data?.standards ?? []))
      .catch(() => {})
      .finally(() => setStandardsLoading(false));
  }, []);

  const rebuildClassCounts = useCallback(async () => {
    try {
      const res = await getAssignments({ page: 1, pageSize: 200 });
      const list = res.data?.data?.assignments ?? [];
      const counts = {};
      list.forEach((a) => { counts[a.standard_id] = (counts[a.standard_id] ?? 0) + 1; });
      setClassCounts(counts);
    } catch { }
  }, []);

  useEffect(() => { rebuildClassCounts(); }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, reviewedRes] = await Promise.all([
        getAssignments({ page: 1, pageSize: 1 }),
        getAssignments({ page: 1, pageSize: 1, isReviewed: true }),
      ]);
      const total = allRes.data?.data?.pagination?.total_count ?? 0;
      const reviewed = reviewedRes.data?.data?.pagination?.total_count ?? 0;
      setStatCounts({ total, reviewed, pending: Math.max(0, total - reviewed) });
    } catch { }
  }, []);

  const fetchAssignments = useCallback(async (pg = page) => {
    setLoading(true); setError("");
    try {
      const params = { page: pg, pageSize: PAGE_SIZE, sortBy };
      if (statusFilter) params.statusFilter = statusFilter;
      if (isReviewedFilter !== "") params.isReviewed = isReviewedFilter === "true";
      if (isPublishedFilter !== "") params.isPublished = isPublishedFilter === "true";
      const res = await getAssignments(params);
      let list = res.data?.data?.assignments ?? [];
      if (selectedStandardId) list = list.filter((a) => a.standard_id === selectedStandardId);
      setAssignments(list);
      setPagination(res.data?.data?.pagination ?? null);
    } catch {
      setError("Failed to load assignments.");
    } finally { setLoading(false); }
  }, [page, statusFilter, sortBy, isReviewedFilter, isPublishedFilter, selectedStandardId]);

  useEffect(() => { setPage(1); fetchAssignments(1); fetchStats(); }, [statusFilter, sortBy, isReviewedFilter, isPublishedFilter, selectedStandardId]);
  useEffect(() => { fetchAssignments(page); }, [page]);

  const refreshAll = useCallback(() => {
    fetchAssignments(page);
    fetchStats();
    rebuildClassCounts();
  }, [fetchAssignments, fetchStats, rebuildClassCounts, page]);

  const totalPages  = pagination?.total_pages ?? 1;
  const totalCount  = pagination?.total_count ?? 0;
  const activeClass = allStandards.find((s) => s.id === selectedStandardId);
  const hasFilters  = statusFilter || isReviewedFilter || isPublishedFilter || sortBy !== "latest";
  const classesWithAssignments = allStandards.filter((s) => (classCounts[s.id] ?? 0) > 0);

  const handleView = (a) => navigate(`/assignment/${a.assignment_id}`);

  const handleReviewConfirm = async () => {
    if (!reviewTarget) return;
    setIsReviewing(true);
    try {
      await markReviewed(reviewTarget.assignment_id);
      toast.success(`"${reviewTarget.pdf_file_name}" marked as reviewed.`);
      setReviewTarget(null);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark reviewed.");
    } finally { setIsReviewing(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(deleteTarget.assignment_id);
      toast.success(`"${deleteTarget.pdf_file_name}" deleted.`);
      setDeleteTarget(null);
      setPage(1); refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally { setIsDeleting(false); }
  };

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      variants={staggerContainer} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={sectionVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.first_name || "Teacher"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your assignments overview</p>
        </div>
        <button onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all shrink-0">
          <Upload className="w-4 h-4" /> Upload Assignment
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen}    label="Total Assignments" value={statCounts.total}    color="blue"  />
        <StatCard icon={Clock}       label="Pending Review"    value={statCounts.pending}  color="amber" />
        <StatCard icon={CheckCircle} label="Reviewed"          value={statCounts.reviewed} color="green" />
      </motion.div>

      {/* Filter by Class */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filter by Class</h2>
        {standardsLoading ? (
          <ClassSkeleton />
        ) : classesWithAssignments.length === 0 ? (
          <p className="text-sm text-gray-400">No classes with assignments yet. Upload an assignment to see classes here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <button
              onClick={() => setSelectedStandardId("")}
              className={`text-left rounded-xl border p-4 transition-all hover:shadow-sm ${
                selectedStandardId === ""
                  ? "border-gray-400 bg-gray-50 ring-2 ring-gray-200"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${selectedStandardId === "" ? "bg-gray-200" : "bg-gray-100"}`}>
                <BookOpen className={`w-4 h-4 ${selectedStandardId === "" ? "text-gray-700" : "text-gray-400"}`} />
              </div>
              <p className={`text-sm font-bold mb-1 ${selectedStandardId === "" ? "text-gray-900" : "text-gray-500"}`}>All Classes</p>
              <p className="text-xs text-gray-400">{statCounts.total} assignments</p>
            </button>
            {classesWithAssignments.map((s) => (
              <ClassCard key={s.id} standard={s}
                isSelected={selectedStandardId === s.id}
                assignmentCount={classCounts[s.id] ?? 0}
                onClick={() => setSelectedStandardId(selectedStandardId === s.id ? "" : s.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assignment List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {activeClass ? `Class ${activeClass.standard} Assignments` : "Your Assignments"}
            </h2>
            {activeClass && (
              <p className="text-xs text-gray-400 mt-0.5">
                {classCounts[activeClass.id] ?? 0} assignment{(classCounts[activeClass.id] ?? 0) !== 1 ? "s" : ""} ·{" "}
                <button onClick={() => setSelectedStandardId("")} className="text-blue-500 hover:text-blue-700 underline">
                  View all
                </button>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={isReviewedFilter} onChange={(e) => setIsReviewedFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Reviewed: All</option>
              <option value="true">Reviewed</option>
              <option value="false">Unreviewed</option>
            </select>
            <select value={isPublishedFilter} onChange={(e) => setIsPublishedFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Published: All</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={refreshAll} title="Refresh"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {hasFilters && (
              <button onClick={() => { setStatusFilter(""); setIsReviewedFilter(""); setIsPublishedFilter(""); setSortBy("latest"); }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-4">
          {loading ? <LoadingSkeleton />
          : error ? (
            <div className="flex items-center justify-center gap-3 h-32 rounded-xl border border-dashed border-red-200 bg-red-50">
              <AlertCircle className="w-5 h-5 text-red-500" /><p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 rounded-xl border border-dashed border-gray-200">
              <BookOpen className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">
                {activeClass ? `No assignments for Class ${activeClass.standard}` : "No assignments yet"}
              </p>
              <button onClick={() => navigate("/upload")}
                className="mt-3 inline-flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload your first assignment
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <AssignmentRow key={a.assignment_id} assignment={a} allStandards={allStandards}
                  onView={handleView} onEdit={setEditTarget}
                  onReview={setReviewTarget} onPublish={setPublishTarget} onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />
        </div>
      </div>

      {/* ── Portals / Modals ── */}

      <AnimatePresence>
        {reviewTarget && (
          <ReviewConfirmDialog
            assignmentName={reviewTarget.pdf_file_name}
            isLoading={isReviewing}
            onConfirm={handleReviewConfirm}
            onCancel={() => setReviewTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete Assignment"
            message={`Are you sure you want to delete "${deleteTarget.pdf_file_name}"? This action cannot be undone.`}
            confirmLabel="Delete" confirmStyle="danger"
            isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {editTarget && (
        <EditAssignmentModal
          assignmentId={editTarget.assignment_id}
          onClose={() => setEditTarget(null)}
          onSaved={refreshAll}
        />
      )}

      {publishTarget && (
        <PublishModal
          assignmentId={publishTarget.assignment_id}
          assignmentName={publishTarget.pdf_file_name}
          onClose={() => setPublishTarget(null)}
          onPublished={refreshAll}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;