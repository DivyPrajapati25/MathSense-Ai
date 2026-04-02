import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader, AlertCircle, CheckCircle,
  XCircle, MessageSquare, Brain, Award, FileText, Clock,
  ChevronDown, ChevronUp,
} from "lucide-react";
import MathText from "../../components/common/MathText/MathText";
import { formatDate } from "../../utils/formatDate";
import { getStudentAssignment } from "../../services/studentService";

const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS  = 3000;

const parseFeedback = (feedback) => {
  if (!feedback) return null;
  try {
    const parsed = JSON.parse(feedback);
    if (parsed?.evaluation) return parsed;
    return { plain: String(feedback) };
  } catch { return { plain: String(feedback) }; }
};

const AIFeedbackDisplay = ({ feedback }) => {
  const parsed = parseFeedback(feedback);
  if (!parsed) return null;
  if (parsed.plain) return <p className="text-sm text-[var(--color-text-secondary)]">{parsed.plain}</p>;
  return (
    <div className="space-y-2">
      {parsed.evaluation?.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          {item.correct
            ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--color-text-secondary)]">{item.step}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.obtained_marks} {item.obtained_marks === 1 ? "mark" : "marks"}</p>
          </div>
        </div>
      ))}
      {parsed.critical_mistake && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{parsed.critical_mistake}</p>
        </div>
      )}
    </div>
  );
};

const ScoreBar = ({ value, max, color = "blue" }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = color === "auto"
    ? pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
    : "bg-blue-500";
  return (
    <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-1.5 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }} className={`h-1.5 rounded-full ${barColor}`} />
    </div>
  );
};

const QuestionCard = ({ question, index }) => {
  const [expanded, setExpanded] = useState(true);
  const isCorrect = question.marks_awarded === question.max_marks;
  const isPartial = question.marks_awarded > 0 && question.marks_awarded < question.max_marks;
  const pct = question.max_marks > 0 ? Math.round((question.marks_awarded / question.max_marks) * 100) : 0;
  const statusColor = isCorrect
    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
    : isPartial ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300";
  const leftBorder = isCorrect ? "border-l-green-400" : isPartial ? "border-l-amber-400" : "border-l-red-400";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] border-l-4 ${leftBorder} overflow-hidden`}>
      <button onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors">
        <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
          {question.question_no}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-text-primary)] text-sm leading-relaxed">
            <MathText text={question.question} />
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${statusColor}`}>
              {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {question.marks_awarded}/{question.max_marks} marks
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-[100px]">
              <ScoreBar value={question.marks_awarded} max={question.max_marks} color="auto" />
              <span className="text-xs text-[var(--color-text-muted)] shrink-0">{pct}%</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-[var(--color-text-muted)] mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5" /> Your Answer
              </p>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                <MathText text={question.student_answer || "—"} />
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Brain className="w-3.5 h-3.5" /> Model Answer
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
                <MathText text={question.final_answer || question.ai_generated_answer || "—"} />
              </p>
            </div>
          </div>
          {question.ai_feedback && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <Brain className="w-3.5 h-3.5" /> AI Feedback
              </p>
              <AIFeedbackDisplay feedback={question.ai_feedback} />
            </div>
          )}
          {question.teacher_feedback && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <MessageSquare className="w-3.5 h-3.5" /> Teacher Feedback
              </p>
              <AIFeedbackDisplay feedback={question.teacher_feedback} />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const ProcessingState = ({ timedOut }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      {timedOut ? <AlertCircle className="w-10 h-10 text-orange-500" /> : <Loader className="w-10 h-10 animate-spin text-blue-600" />}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
          {timedOut ? "Processing is taking longer than expected" : "AI is evaluating..."}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {timedOut ? "Please refresh the page in a few minutes to check your results." : "Your answers are being processed. This page will update automatically."}
        </p>
        {timedOut && (
          <button onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Refresh Page
          </button>
        )}
      </div>
    </div>
  </div>
);

const SummaryStat = ({ label, value, sub, color = "blue" }) => {
  const palette = {
    blue:   "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    gray:   "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
    green:  "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  };
  return (
    <div className={`${palette[color]} rounded-xl p-4 text-center`}>
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
};

const StudentAssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStudentAssignment(id);
        const result = res.data?.data ?? null;
        setData(result);
        setIsLoading(false);
        const s = result?.status;
        const errMsg = result?.error_message;
        if (s === "PENDING" || s === "PROCESSING") {
          if (errMsg) { setData((prev) => ({ ...prev, status: "FAILED" })); return; }
          startPolling();
        }
      } catch (err) {
        setError(typeof err.response?.data?.message === "string" ? err.response.data.message : "Failed to load assignment.");
        setIsLoading(false);
      }
    };
    const startPolling = () => {
      attemptsRef.current = 0;
      intervalRef.current = setInterval(async () => {
        if (attemptsRef.current >= MAX_POLL_ATTEMPTS) { clearInterval(intervalRef.current); setTimedOut(true); return; }
        attemptsRef.current += 1;
        try {
          const res = await getStudentAssignment(id);
          const result = res.data?.data ?? null;
          setData(result);
          if (result?.status === "COMPLETED" || result?.status === "FAILED") clearInterval(intervalRef.current);
          if (result?.status === "PROCESSING" && result?.error_message) { clearInterval(intervalRef.current); setData((prev) => ({ ...prev, status: "FAILED" })); }
        } catch { clearInterval(intervalRef.current); }
      }, POLL_INTERVAL_MS);
    };
    fetchData();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  const backBtnCls = "inline-flex items-center gap-2 h-9 px-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors shadow-sm";

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate("/student")} className={`${backBtnCls} mb-6`}><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /><span>{error || "Assignment not found."}</span>
        </div>
      </div>
    );
  }

  if (data.status === "PENDING" || data.status === "PROCESSING") return <ProcessingState timedOut={timedOut} />;

  if (data.status === "FAILED") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate("/student")} className={`${backBtnCls} mb-6`}><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>
        <div className="flex items-start gap-3 p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div><p className="font-semibold mb-1">Processing Failed</p>
            <p className="text-sm">{data.error_message || "The AI could not process your submission. Please re-upload."}</p>
          </div>
        </div>
      </div>
    );
  }

  const percentage = data.total_assignment_marks > 0 ? Math.round((data.obtained_marks / data.total_assignment_marks) * 100) : 0;
  const correctCount = data.questions?.filter((q) => q.marks_awarded === q.max_marks).length ?? 0;
  const partialCount = data.questions?.filter((q) => q.marks_awarded > 0 && q.marks_awarded < q.max_marks).length ?? 0;
  const wrongCount   = data.questions?.filter((q) => q.marks_awarded === 0).length ?? 0;
  const barColor = percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button onClick={() => navigate("/student")} className={backBtnCls}><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.assignment_name}</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Submitted {formatDate(data.submitted_on)}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold self-start ${
            percentage >= 80 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            : percentage >= 50 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300"
          }`}>{percentage}%</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryStat label="Obtained" value={data.obtained_marks} color="blue" />
          <SummaryStat label="Total" value={data.total_assignment_marks} color="gray" />
          <SummaryStat label="Correct" value={correctCount} sub={`of ${data.questions?.length ?? 0} questions`} color="green" />
          <SummaryStat label="Score" value={`${percentage}%`} color="purple" />
        </div>

        <div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
            <span>Overall Score</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{data.obtained_marks}/{data.total_assignment_marks}</span>
          </div>
          <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2.5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} className={`h-2.5 rounded-full ${barColor}`} />
          </div>
        </div>

        {data.questions?.length > 0 && (
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> {correctCount} correct
            </span>
            {partialCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Award className="w-3.5 h-3.5" /> {partialCount} partial
              </span>
            )}
            {wrongCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
                <XCircle className="w-3.5 h-3.5" /> {wrongCount} incorrect
              </span>
            )}
          </div>
        )}
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Questions & Answers
        </h3>
        {!data.questions?.length ? (
          <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-[var(--color-border)]">
            <p className="text-[var(--color-text-muted)] text-sm">No questions available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.questions.map((q, i) => (
              <QuestionCard key={q.question_id || q.question_no} question={q} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentDetail;