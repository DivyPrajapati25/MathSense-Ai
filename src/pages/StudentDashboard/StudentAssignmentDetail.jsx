import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft, Loader, AlertCircle, CheckCircle,
    XCircle, MessageSquare, Brain, Award, FileText
} from "lucide-react";
// ✅ ADDED: KaTeX for LaTeX rendering
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import api from "../../services/api";

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
};

// ✅ ADDED: Renders text with LaTeX math expressions
// Handles both $...$ inline and $$...$$ block math
const MathText = ({ text }) => {
    if (!text) return null;

    try {
        // Split by $$...$$ (block math) first
        const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

        return (
            <span>
                {blockParts.map((part, i) => {
                    if (part.startsWith("$$") && part.endsWith("$$")) {
                        const math = part.slice(2, -2).trim();
                        return (
                            <span key={i} className="block my-1">
                                <BlockMath math={math} />
                            </span>
                        );
                    }

                    // Split remaining by $...$ (inline math)
                    const inlineParts = part.split(/(\$[^$\n]+?\$)/g);
                    return (
                        <span key={i}>
                            {inlineParts.map((inline, j) => {
                                if (inline.startsWith("$") && inline.endsWith("$") && inline.length > 2) {
                                    const math = inline.slice(1, -1).trim();
                                    return <InlineMath key={j} math={math} />;
                                }
                                return <span key={j}>{inline}</span>;
                            })}
                        </span>
                    );
                })}
            </span>
        );
    } catch {
        // ✅ Fallback to plain text if KaTeX fails
        return <span>{text}</span>;
    }
};

const parseFeedback = (feedback) => {
    if (!feedback) return null;
    try {
        const parsed = JSON.parse(feedback);
        if (parsed?.evaluation) return parsed;
        return { plain: String(feedback) };
    } catch {
        return { plain: String(feedback) };
    }
};

const AIFeedbackDisplay = ({ feedback }) => {
    const parsed = parseFeedback(feedback);
    if (!parsed) return null;

    if (parsed.plain) {
        return <p className="text-sm text-purple-900">{parsed.plain}</p>;
    }

    return (
        <div className="space-y-2">
            {parsed.evaluation?.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                    {item.correct
                        ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                        <p className="text-sm text-purple-900">{item.step}</p>
                        <p className="text-xs text-purple-600">{item.obtained_marks} marks</p>
                    </div>
                </div>
            ))}
            {parsed.critical_mistake && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-medium text-red-600">⚠️ {parsed.critical_mistake}</p>
                </div>
            )}
        </div>
    );
};

const QuestionCard = ({ question, index }) => {
    const isCorrect = question.marks_awarded === question.max_marks;
    const isPartial = question.marks_awarded > 0 && question.marks_awarded < question.max_marks;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0">
                        {question.question_no}
                    </span>
                    {/* ✅ CHANGED: render question with LaTeX */}
                    <p className="font-medium text-gray-900">
                        <MathText text={question.question} />
                    </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
                    isCorrect ? "bg-green-100 text-green-700 border border-green-200"
                    : isPartial ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                    {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {question.marks_awarded}/{question.max_marks}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Your Answer
                    </p>
                    {/* ✅ CHANGED: render student answer with LaTeX */}
                    <p className="text-sm text-gray-800">
                        <MathText text={question.student_answer || "—"} />
                    </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> AI Answer
                    </p>
                    {/* ✅ CHANGED: render AI answer with LaTeX */}
                    <p className="text-sm text-blue-900">
                        <MathText text={question.ai_generated_answer || "—"} />
                    </p>
                </div>
            </div>

            {question.ai_feedback && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs font-medium text-purple-600 mb-2 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> AI Feedback
                    </p>
                    <AIFeedbackDisplay feedback={question.ai_feedback} />
                </div>
            )}

            {question.teacher_feedback && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Teacher Feedback
                    </p>
                    <AIFeedbackDisplay feedback={question.teacher_feedback} />
                </div>
            )}
        </motion.div>
    );
};

const StudentAssignmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get(`/student/assignment/${id}`)
            .then((res) => setData(res.data?.data ?? null))
            .catch((err) => {
                const message = err.response?.data?.message;
                setError(typeof message === "string" ? message : "Failed to load assignment.");
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error || "Assignment not found."}</span>
                </div>
            </div>
        );
    }

    const percentage = data.total_assignment_marks > 0
        ? Math.round((data.obtained_marks / data.total_assignment_marks) * 100)
        : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => navigate("/student")}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{data.assignment_name}</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Obtained</p>
                        <p className="text-2xl font-bold text-blue-700">{data.obtained_marks}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-2xl font-bold text-gray-700">{data.total_assignment_marks}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Percentage</p>
                        <p className="text-2xl font-bold text-green-700">{percentage}%</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                        <p className="text-sm font-bold text-purple-700">{formatDate(data.submitted_on)}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Score</span><span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-2 rounded-full ${percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        />
                    </div>
                </div>
            </motion.div>

            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" /> Questions & Answers
            </h2>

            {!data.questions?.length ? (
                <div className="flex items-center justify-center h-32 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No questions available yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {data.questions.map((q, i) => (
                        <QuestionCard key={q.question_no} question={q} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentAssignmentDetail;