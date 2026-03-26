import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, ChevronDown, Loader, AlertCircle,
  BookOpen, Target, Hash, Sparkles, Calendar, CheckCircle2,
} from "lucide-react";
import { sectionVariants, staggerContainer, cardVariants } from "../../../utils/animations";
import api from "../../../services/api";

/* ─── helpers ─── */
const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: "border-green-200 bg-green-100 text-green-800",
    PENDING:   "border-yellow-200 bg-yellow-100 text-yellow-800",
    FAILED:    "border-red-200 bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-medium whitespace-nowrap ${styles[status] ?? "border-gray-200 bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

const DifficultyBadge = ({ level }) => {
  const styles = {
    Easy:   "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Hard:   "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${styles[level] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      <Target className="w-3 h-3" /> {level}
    </span>
  );
};

const TopicBadge = ({ topic }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
    <BookOpen className="w-3 h-3" /> {topic}
  </span>
);

/* ─── Question Accordion ─── */
const QuestionCard = ({ question, index }) => {
  const [open, setOpen] = useState(false);

  // parse AI answer into steps
  const answerLines = (question.AI_generated_answer || "").split("\n").filter(Boolean);

  return (
    <motion.div
      variants={cardVariants}
      className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {question.question_no}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">
              {question.question_text}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {question.Difficulty_Level && <DifficultyBadge level={question.Difficulty_Level} />}
              {question.topic && <TopicBadge topic={question.topic} />}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Hash className="w-3 h-3" /> {question.max_marks} marks
              </span>
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* expandable content */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">
              {/* question text */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Question</label>
                <p className="mt-1.5 text-sm text-gray-800 leading-relaxed">{question.question_text}</p>
              </div>

              {/* AI generated answer */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI-Generated Answer
                </label>
                <div className="mt-2 p-4 bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="space-y-1.5">
                    {answerLines.map((line, i) => {
                      const isStep = line.toLowerCase().startsWith("step");
                      const isFinal = line.toLowerCase().startsWith("final");
                      return (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed ${
                            isFinal
                              ? "font-semibold text-green-700 mt-3 pt-3 border-t border-blue-200"
                              : isStep
                                ? "font-medium text-gray-800"
                                : "text-gray-700 pl-4"
                          }`}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* teacher feedback - show if exists */}
              {question.teacher_feedback && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teacher Feedback</label>
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-gray-700">{question.teacher_feedback}</p>
                  </div>
                </div>
              )}

              {/* corrected answer - show if exists */}
              {question.corrected_final_answer && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Corrected Answer</label>
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">{question.corrected_final_answer}</p>
                  </div>
                </div>
              )}

              {/* corrected steps - show if exists */}
              {question.corrected_solution_steps && question.corrected_solution_steps.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Corrected Steps</label>
                  <div className="mt-2 space-y-2">
                    {question.corrected_solution_steps.map((step, i) => (
                      <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-medium text-green-600 mb-1">Step {step.step_no}</p>
                        <p className="text-sm font-mono text-gray-800">{step.expression}</p>
                        {step.explanation && <p className="text-xs text-gray-600 mt-1">{step.explanation}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* meta info */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
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
    <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
    <div className="h-10 w-2/3 bg-gray-200 rounded animate-pulse" />
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

/* ─── Main Page ─── */
const AssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/teacher/assignments/${id}`)
      .then((res) => setAssignment(res.data?.data ?? null))
      .catch((err) => {
        const msg = err.response?.data?.message || "Failed to load assignment details.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 h-9 px-4 mb-6 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  const questions = assignment.questions ?? [];

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* back button */}
      <motion.div variants={sectionVariants}>
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 h-9 px-4 mb-6 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </button>
      </motion.div>

      {/* assignment header */}
      <motion.div variants={sectionVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{assignment.pdf_file_name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <StatusBadge status={assignment.status} />
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" /> {assignment.total_questions} questions
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {formatDate(assignment.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* error message if FAILED */}
        {assignment.error_message && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{assignment.error_message}</span>
          </div>
        )}
      </motion.div>

      {/* summary cards */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{assignment.total_questions ?? questions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Questions</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">
            {questions.reduce((sum, q) => sum + (q.max_marks || 0), 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Marks</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-600">
            {[...new Set(questions.map(q => q.topic).filter(Boolean))].length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Topics</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-600">
            {questions.filter(q => q.Difficulty_Level === "Medium" || q.Difficulty_Level === "Hard").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Medium/Hard</p>
        </div>
      </motion.div>

      {/* questions heading */}
      <motion.div variants={sectionVariants} className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Questions & AI Answers
        </h2>
        <span className="text-sm text-gray-500">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {/* question list */}
      {questions.length === 0 ? (
        <motion.div variants={sectionVariants} className="flex items-center justify-center h-32 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No questions found for this assignment.</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={i} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AssignmentDetailPage;
