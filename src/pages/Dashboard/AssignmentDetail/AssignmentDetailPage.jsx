import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, ChevronDown, Loader, AlertCircle,
  BookOpen, Target, Hash, Sparkles, Calendar, CheckCircle2,
  Trash2, CheckCircle, Send, X,
} from "lucide-react";
import { sectionVariants, staggerContainer, cardVariants } from "../../../utils/animations";
import StatusBadge from "../../../components/common/StatusBadge/StatusBadge";
import MathText from "../../../components/common/MathText/MathText";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../../components/common/Toast/Toast";
import { formatDate } from "../../../utils/formatDate";
import {
  getAssignmentDetail, deleteAssignment,
  markReviewed, publishAssignment,
} from "../../../services/teacherService";
import useScrollLock from "../../../hooks/useScrollLock";

/* ─── Badge helpers ─── */
const DifficultyBadge = ({ level }) => {
  const styles = {
    Easy:   "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    Medium: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    Hard:   "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${styles[level] ?? "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]"}`}>
      <Target className="w-3 h-3" /> {level}
    </span>
  );
};

const TopicBadge = ({ topic }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium">
    <BookOpen className="w-3 h-3" /> {topic}
  </span>
);

/* ─── Publish Modal ─── */
const PublishModal = ({ assignmentId, onClose, onPublished }) => {
  useScrollLock();
  const toast = useToast();
  const [deadline, setDeadline] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!deadline) { toast.error("Please set a deadline."); return; }
    setIsPublishing(true);
    try {
      await publishAssignment(assignmentId, new Date(deadline).toISOString());
      toast.success("Assignment published successfully!");
      onPublished?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to publish."); }
    finally { setIsPublishing(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-card)] rounded-2xl shadow-xl border border-[var(--color-border)] w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Publish Assignment</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Set a deadline for students to submit.</p>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Deadline</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isPublishing}
            className="h-9 px-4 rounded-lg text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handlePublish} disabled={isPublishing || !deadline}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2">
            {isPublishing ? <><Loader className="w-4 h-4 animate-spin" /> Publishing...</> : <><Send className="w-4 h-4" /> Publish</>}
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-opacity"><X className="w-4 h-4" /></button>
      </div>
    </>
  );
};

/* ─── Question Accordion ─── */
const QuestionCard = ({ question }) => {
  const [open, setOpen] = useState(false);
  const answerLines = (question.final_answer || "").split("\n").filter(Boolean);

  return (
    <motion.div variants={cardVariants}
      className="border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-card)] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold shrink-0">
            {question.question_no}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base text-[var(--color-text-primary)] line-clamp-2">
              <MathText text={question.question_text} />
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {question.Difficulty_Level && <DifficultyBadge level={question.Difficulty_Level} />}
              {question.topic && <TopicBadge topic={question.topic} />}
              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Hash className="w-3 h-3" /> {question.max_marks} marks
              </span>
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-[var(--color-text-muted)] shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-2 border-t border-[var(--color-border)] space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Question</label>
                <p className="mt-1.5 text-sm text-[var(--color-text-primary)] leading-relaxed"><MathText text={question.question_text} /></p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> AI-Generated Answer
                </label>
                <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="space-y-1.5">
                    {answerLines.map((line, i) => {
                      const isStep = line.toLowerCase().startsWith("step");
                      const isFinal = line.toLowerCase().startsWith("final");
                      return (
                        <p key={i} className={`text-sm leading-relaxed ${
                          isFinal ? "font-semibold text-green-700 dark:text-green-400 mt-3 pt-3 border-t border-blue-200 dark:border-blue-800"
                          : isStep ? "font-medium text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)] pl-4"
                        }`}><MathText text={line} /></p>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Status: {question.status}</span>
                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Max Marks: {question.max_marks}</span>
                {question.Difficulty_Level && <span>Difficulty: {question.Difficulty_Level}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Loading skeleton ─── */
const LoadingSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div className="h-8 w-40 bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
    <div className="h-10 w-2/3 bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

/* ─── Main Page ─── */
const AssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const fetchData = () => {
    setLoading(true); setError("");
    getAssignmentDetail(id)
      .then((res) => setAssignment(res.data?.data ?? null))
      .catch((err) => setError(err.response?.data?.message || "Failed to load assignment details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleMarkReviewed = async () => {
    try { await markReviewed(id); toast.success("Assignment marked as reviewed."); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to mark reviewed."); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try { await deleteAssignment(id); toast.success("Assignment deleted."); navigate("/"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to delete."); }
    finally { setIsDeleting(false); }
  };

  const btnCls = "inline-flex items-center gap-2 h-9 px-4 mb-6 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors shadow-sm";

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className={btnCls}><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      </div>
    );
  }

  if (!assignment) return null;
  const questions = assignment.questions ?? [];

  return (
    <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={sectionVariants}>
        <button onClick={() => navigate(-1)} className={btnCls}><ArrowLeft className="w-4 h-4" /> Back to Assignments</button>
      </motion.div>

      <motion.div variants={sectionVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">{assignment.pdf_file_name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <StatusBadge status={assignment.status} />
              {assignment.is_reviewed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> Reviewed
                </span>
              ) : assignment.status === "COMPLETED" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 text-xs font-medium">
                  Not Reviewed
                </span>
              ) : null}
              <span className="flex items-center gap-1"><Hash className="w-4 h-4" /> {assignment.total_questions} questions</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(assignment.created_at)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {assignment.status === "COMPLETED" && !assignment.is_reviewed && (
              <button onClick={handleMarkReviewed}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors shadow-sm">
                <CheckCircle className="w-4 h-4" /> Mark Reviewed
              </button>
            )}
            {assignment.is_reviewed && !assignment.is_published && (
              <button onClick={() => setPublishOpen(true)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
                <Send className="w-4 h-4" /> Publish
              </button>
            )}
            <button onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {assignment.error_message && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{assignment.error_message}</span>
          </div>
        )}
      </motion.div>

      <motion.div variants={sectionVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { val: assignment.total_questions ?? questions.length, label: "Total Questions", color: "text-blue-600 dark:text-blue-400" },
          { val: questions.reduce((s, q) => s + (q.max_marks || 0), 0), label: "Total Marks", color: "text-green-600 dark:text-green-400" },
          { val: [...new Set(questions.map(q => q.topic).filter(Boolean))].length, label: "Topics", color: "text-purple-600 dark:text-purple-400" },
          { val: questions.filter(q => q.Difficulty_Level === "Medium" || q.Difficulty_Level === "Hard").length, label: "Medium/Hard", color: "text-orange-600 dark:text-orange-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={sectionVariants} className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Questions & AI Answers
        </h2>
        <span className="text-sm text-[var(--color-text-muted)]">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {questions.length === 0 ? (
        <motion.div variants={sectionVariants} className="flex items-center justify-center h-32 rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)] text-sm">No questions found for this assignment.</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-4">
          {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
        </motion.div>
      )}

      <AnimatePresence>
        {deleteOpen && (
          <ConfirmDialog title="Delete Assignment"
            message={`Are you sure you want to delete "${assignment.pdf_file_name}"? This action cannot be undone.`}
            confirmLabel="Delete" confirmStyle="danger" isLoading={isDeleting}
            onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {publishOpen && (
          <PublishModal assignmentId={id} onClose={() => setPublishOpen(false)} onPublished={fetchData} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssignmentDetailPage;
