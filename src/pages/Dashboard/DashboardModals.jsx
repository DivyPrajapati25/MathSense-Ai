import { useState, useEffect } from "react";
import {
  Loader, AlertCircle, X, ChevronDown, ChevronUp,
  Send, Pencil, Lock, ClipboardCheck, Copy, CalendarCheck,
} from "lucide-react";
import MathText from "../../components/common/MathText/MathText";
import { useToast } from "../../components/common/Toast/Toast";
import useScrollLock from "../../hooks/useScrollLock";
import {
  getAssignmentDetail, updateAssignment, publishAssignment,
} from "../../services/teacherService";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

/* ─── Helper: get current datetime-local string for min attribute ─── */
const getNowLocalMin = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/* ─── Review Confirm Dialog ─── */
export const ReviewConfirmDialog = ({ assignmentName, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative z-10 bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-md p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Mark as Reviewed?</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            You're about to mark <span className="font-medium text-[var(--color-text-primary)]">"{assignmentName}"</span> as reviewed.
          </p>
        </div>
      </div>
      <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
          Once marked as reviewed, you will <span className="underline">not be able to edit</span> this assignment. Make sure all answers and difficulty levels are correct before proceeding.
        </p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} disabled={isLoading}
          className="h-9 px-4 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] disabled:opacity-50 transition-colors">
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
export const PublishModal = ({ assignmentId, assignmentName, onClose, onPublished }) => {
  useScrollLock();
  const toast = useToast();
  const [deadline, setDeadline] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [minDateTime] = useState(getNowLocalMin);

  const handlePublish = async () => {
    if (!deadline) {
      toast.error("Please set a deadline.");
      return;
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-0.5">Publish Assignment</h3>
              <p className="text-sm text-[var(--color-text-muted)] truncate max-w-[220px]">"{assignmentName}"</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Set Submission Deadline <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={deadline}
            min={minDateTime}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Only future dates are allowed
          </p>
        </div>

        {formattedDeadline && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Students must submit by <strong>{formattedDeadline}</strong>
            </p>
          </div>
        )}

        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-300 font-medium">
            Once published, the deadline <span className="underline">cannot be changed</span>. Students will be notified and will see this date immediately.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={isPublishing}
            className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] disabled:opacity-50 transition-colors">
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
export const EditAssignmentModal = ({ assignmentId, onClose, onSaved }) => {
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
      <div className="relative z-10 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Edit Assignment</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              Click <span className="font-medium text-blue-600 dark:text-blue-400">"Edit Answer"</span> on any question to correct it
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <div className="flex items-center justify-center h-32"><Loader className="w-6 h-6 animate-spin text-blue-600" /></div>}
          {!isLoading && error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {!isLoading && !error && (
            <div className="space-y-3">
              {questions.map((q) => {
                const isExpanded = expandedId === q.id;
                const isEditing = editingIds.has(q.id);
                return (
                  <div key={q.id} className={`border rounded-xl overflow-hidden transition-colors ${isEditing ? "border-blue-300 dark:border-blue-600" : "border-[var(--color-border)]"}`}>
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="w-full flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isEditing ? "bg-blue-600 text-white" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                          {q.question_no}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate"><MathText text={q.question_text} /></p>
                          {isEditing && <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">✏️ Editing...</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                          (edits[q.id]?.difficulty_level || q.Difficulty_Level) === "Easy" ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                          : (edits[q.id]?.difficulty_level || q.Difficulty_Level) === "Hard" ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
                        }`}>{edits[q.id]?.difficulty_level || q.Difficulty_Level}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-4 space-y-4 border-t border-[var(--color-border)]">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-[var(--color-text-secondary)]">AI Generated Answer <span className="text-[var(--color-text-muted)]">(read only)</span></label>
                            {!isEditing
                              ? <button type="button" onClick={() => handleEditAnswer(q)} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"><Copy className="w-3 h-3" /> Edit Answer</button>
                              : <button type="button" onClick={() => handleCancelEdit(q.id)} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors"><X className="w-3 h-3" /> Cancel Edit</button>
                            }
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-900 dark:text-blue-200 whitespace-pre-line">
                            <MathText text={q.final_answer} />
                          </div>
                        </div>
                        {isEditing && (
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">
                              Corrected Answer <span className="text-[var(--color-text-muted)] font-normal ml-1">(edit below)</span>
                            </label>
                            <textarea rows={8} value={edits[q.id]?.corrected_final_answer ?? ""}
                              onChange={(e) => setEdit(q.id, "corrected_final_answer", e.target.value)}
                              className="resize-y w-full rounded-xl border border-blue-300 dark:border-blue-700 bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono" />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">Difficulty Level</label>
                          <div className="flex gap-2">
                            {DIFFICULTY_OPTIONS.map((d) => (
                              <button key={d} type="button" onClick={() => setEdit(q.id, "difficulty_level", d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  (edits[q.id]?.difficulty_level ?? q.Difficulty_Level) === d
                                    ? d === "Easy" ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300" : d === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300" : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                                    : "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                                }`}>{d}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]">
                          <span>Max marks: <strong className="text-[var(--color-text-secondary)]">{q.max_marks}</strong></span>
                          <span>·</span>
                          <span>Topic: <strong className="text-[var(--color-text-secondary)]">{q.topic}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex items-center justify-between bg-[var(--color-bg-secondary)] rounded-b-2xl">
          {editingIds.size > 0
            ? <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">✏️ {editingIds.size} question{editingIds.size > 1 ? "s" : ""} edited</span>
            : <span className="text-xs text-[var(--color-text-muted)]">Click "Edit Answer" on any question to start</span>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isSaving} className="h-10 px-5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={isSaving || isLoading} className="h-10 px-5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
              {isSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
