import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronDown, FileText, CircleCheckBig,
  Send, Download, Calendar, Sparkles, Clock,
} from "lucide-react";
import { ASSIGNMENT_DETAIL, STATUS_STYLES } from "./GradingData";

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>
    {status}
  </span>
);

const QuestionItem = ({ q, onScoreChange }) => {
  const [open, setOpen] = useState(false);

  const isMinor = q.status === "Minor Issues";
  const isPerfect = q.status === "Perfect";
  const numColor = isPerfect ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  const scoreColor = isPerfect ? "text-green-600" : "text-orange-600";

  return (
    <div className={`border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow`}>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${numColor}`}>
            {q.id}
          </div>
          <div>
            <div className="font-medium text-sm sm:text-base">{q.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{q.status}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs text-gray-500">AI Score</div>
            <div className={`text-sm font-medium ${scoreColor}`}>{q.aiScore}/{q.maxScore}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Question</label>
                <p className="mt-1 text-sm text-gray-800">{q.question}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student's Work</label>
                <div className="mt-2 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <pre className="font-mono text-base sm:text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {q.studentWork}
                  </pre>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Sparkles className="w-3 h-3 text-blue-500" /> AI Analysis
                </label>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">{q.analysis}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correct Answer</label>
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">{q.correctAnswer}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Points for this question:</label>
                  <input
                    type="number"
                    defaultValue={q.aiScore}
                    min={0}
                    max={q.maxScore}
                    onChange={(e) => onScoreChange(q.id, Number(e.target.value))}
                    className="w-20 h-7 text-center border border-gray-200 rounded-md text-sm outline-none bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <span className="text-sm text-gray-500">/ {q.maxScore}</span>
                </div>
                {isMinor && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-yellow-200 bg-yellow-100 text-yellow-800 text-xs font-medium">
                    Review concepts
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentCard = ({ student, assignment, isApprovedAll, onApproveCountChange }) => {
  const [approved, setApproved] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState(student.aiFeedback);
  const [scores, setScores] = useState(
    Object.fromEntries((student.questions || []).map((q) => [q.id, q.aiScore]))
  );

  const effectiveApproved = isApprovedAll || approved;

  const handleApprove = () => {
    const newVal = !approved;
    setApproved(newVal);
    onApproveCountChange(newVal ? 1 : -1);
  };

  const handleScoreChange = (qId, val) => {
    setScores((prev) => ({ ...prev, [qId]: val }));
  };

  const aiScore = student.questions.reduce((s, q) => s + q.aiScore, 0);
  const maxScore = student.questions.reduce((s, q) => s + q.maxScore, 0);
  const finalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const hasQuestions = student.questions.length > 0;

  if (!hasQuestions) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-medium text-gray-900 mb-2">{student.name}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
            <Clock size={11} /> Not Graded
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {student.date}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">

      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-2">{student.name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <StatusBadge status={effectiveApproved ? "Approved" : student.status} />
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {student.date}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
            <FileText className="w-5 h-5 text-blue-600" /> Questions &amp; Student Work
          </h4>
          <span className="text-sm text-gray-500">{student.questions.length} Questions</span>
        </div>
        <div className="space-y-3">
          {student.questions.map((q) => (
            <QuestionItem key={q.id} q={q} onScoreChange={handleScoreChange} />
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">AI Score</label>
          <div className="text-2xl font-bold text-blue-600 mt-1">{aiScore} / {maxScore}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">Final Score</label>
          <input
            type="number"
            value={finalScore}
            max={assignment.points}
            readOnly
            className="h-9 w-full rounded-md border border-gray-200 px-3 bg-gray-50 text-2xl font-bold text-green-600 outline-none"
          />
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">AI Feedback</label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-700">
            {student.aiFeedback}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">Final Feedback (Editable)</label>
          <textarea
            rows={3}
            value={finalFeedback}
            onChange={(e) => setFinalFeedback(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleApprove}
          className={`flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-colors ${effectiveApproved
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
            }`}
        >
          <CircleCheckBig className="w-4 h-4" />
          {effectiveApproved ? "Approved" : "Approve"}
        </button>
        <button className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition-colors">
          <Download className="w-4 h-4" /> Download Feedback
        </button>
      </div>
    </div>
  );
};

const GradingDetailPage = ({ assignment, allAssignments, onBack, onSwitchAssignment }) => {
  const detail = ASSIGNMENT_DETAIL[assignment.id] || { students: [] };
  const students = detail.students;

  const [approveAllActive, setApproveAllActive] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);

  const handleApproveAll = () => {
    setApproveAllActive(true);
    setApprovedCount(students.filter((s) => s.questions.length > 0).length);
  };

  const handleApproveCountChange = (delta) => {
    setApprovedCount((c) => Math.max(0, c + delta));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 h-9 px-4 mb-6 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </button>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Assignment Title</label>
          <select
            value={assignment.id}
            onChange={(e) => onSwitchAssignment(Number(e.target.value))}
            className="w-full md:w-96 h-9 rounded-md border border-gray-200 px-3 bg-white text-sm outline-none focus:border-blue-400 cursor-pointer"
          >
            {allAssignments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
            <p className="text-gray-600">Total Points: {assignment.points} | Students: {assignment.submissions}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleApproveAll}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <CircleCheckBig className="w-4 h-4" /> Approve All
            </button>
            <button
              disabled={approvedCount === 0}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              <Send className="w-4 h-4" /> Send All Approved ({approvedCount})
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {students.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            assignment={assignment}
            isApprovedAll={approveAllActive}
            onApproveCountChange={handleApproveCountChange}
          />
        ))}
      </div>
    </div>
  );
};

export default GradingDetailPage;