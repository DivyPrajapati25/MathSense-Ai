import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload, CheckCircle, XCircle, Loader, AlertCircle,
  FileText, X, CalendarClock,
} from "lucide-react";
import { useToast } from "../../components/common/Toast/Toast";
import { formatDate } from "../../utils/formatDate";
import { uploadStudentAssignment, getUploadStatus } from "../../services/studentService";

const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS  = 3000;

/* ─── Upload Modal ─── */
export const UploadModal = ({ assignment, onClose, onSuccess }) => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else toast.error("Only PDF files are accepted.");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    try {
      const res = await uploadStudentAssignment(file, assignment.teacher_assignment_id);
      const studentAssignmentId = res.data?.data?.student_assignment_id;
      toast.success("Uploaded! AI is evaluating your answers.");
      onSuccess(studentAssignmentId);
      onClose();
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 409) {
        const msg = typeof message === "object" ? message.message : message;
        toast.error(msg || "You have already submitted this assignment.");
      } else if (status === 403) {
        toast.error(message || "Assignment not published or deadline passed.");
      } else if (!err.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(typeof message === "string" ? message : "Upload failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Submit Assignment</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Upload your answer as a PDF</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{assignment.assignment_name}</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 flex items-center gap-1">
              <CalendarClock className="w-3 h-3" /> Due {formatDate(assignment.deadline)}
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl min-h-[110px] flex flex-col items-center justify-center gap-2 transition-all ${
            dragOver ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : file ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
            : "border-[var(--color-border)] hover:border-blue-300 dark:hover:border-blue-700 hover:bg-[var(--color-bg-secondary)]"
          }`}
        >
          {file ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">{file.name}</p>
              <p className="text-xs text-green-500 dark:text-green-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-[var(--color-text-muted)]" />
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Drop PDF here or click to browse</p>
              <p className="text-xs text-[var(--color-text-muted)]">Max file size: 30 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={isSubmitting}
            className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!file || isSubmitting}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center gap-2">
            {isSubmitting
              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
              : <><Upload className="w-4 h-4" /> Submit</>}
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* ─── Task Status Banner ─── */
export const TaskStatusBanner = ({ assignmentId, onDismiss, onCompleted }) => {
  const [status, setStatus] = useState("PENDING");
  const [timedOut, setTimedOut] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!assignmentId) return;

    attemptsRef.current = 0;
    setTimedOut(false);
    setStatus("PENDING");

    const poll = setInterval(async () => {
      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(poll);
        setTimedOut(true);
        return;
      }
      attemptsRef.current += 1;

      try {
        const res = await getUploadStatus(assignmentId);
        const s = res.data?.data?.status;
        const errMsg = res.data?.data?.error_message;
        setStatus(s);

        if (s === "COMPLETED" || s === "FAILED") {
          clearInterval(poll);
          if (s === "COMPLETED") onCompleted?.();
        }
        if (errMsg && s === "PROCESSING") {
          clearInterval(poll);
          setStatus("FAILED");
        }
      } catch {
        clearInterval(poll);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(poll);
  }, [assignmentId]);

  const cfg = {
    PENDING:    { bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",  text: "text-amber-700 dark:text-amber-300",  icon: Loader,      spin: true,  msg: "Assignment queued — AI will start shortly" },
    PROCESSING: { bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",    text: "text-blue-700 dark:text-blue-300",   icon: Loader,      spin: true,  msg: "AI is evaluating your answers..." },
    COMPLETED:  { bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",  text: "text-green-700 dark:text-green-300",  icon: CheckCircle, spin: false, msg: "Evaluation complete! Check your results. 🎉" },
    FAILED:     { bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",      text: "text-red-600 dark:text-red-300",    icon: XCircle,     spin: false, msg: "Processing failed. Please re-upload." },
  };

  if (timedOut) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="flex-1">Processing is taking longer than expected. Please refresh the page to check status.</span>
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  const c = cfg[status] ?? cfg.PENDING;
  const Icon = c.icon;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${c.bg} ${c.text}`}>
      <Icon className={`w-5 h-5 shrink-0 ${c.spin ? "animate-spin" : ""}`} />
      <span className="flex-1">{c.msg}</span>
      {(status === "COMPLETED" || status === "FAILED") && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};
