import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, Sparkles, X } from "lucide-react";
import { backdropVariants, modalVariants } from "../../utils/animations";

const useScrollLock = () => {
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);
};

export const ProcessingModal = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  useScrollLock();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        return Math.min(p + 2, 100);
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
        variants={modalVariants} initial="hidden" animate="visible" exit="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-gray-900">Processing AI Grading...</h2>
          </div>
          <button
            className="text-gray-400 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            onClick={onComplete}
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Please wait while we analyze all student submissions
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
          <motion.div
            className="h-3 bg-gray-900 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <p className="text-sm text-center text-gray-600 font-medium">{progress}% Complete</p>
      </motion.div>
    </motion.div>
  );
};

export const ViewDetailsModal = ({ assignment, students, onClose }) => {
  useScrollLock();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg border w-full max-w-[calc(100%-2rem)] sm:max-w-lg flex flex-col shadow-lg overflow-hidden"
        style={{ maxHeight: "85vh" }}
        variants={modalVariants} initial="hidden" animate="visible" exit="hidden"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assignment Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">View student submission details, scores, and feedback</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-100 rounded-lg p-1.5 transition-colors shrink-0 ml-4"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 pr-4">
          {students.map((s, idx) => {
            const aiScore    = s.aiScore    ?? s.questions.reduce((sum, q) => sum + q.aiScore, 0);
            const finalScore = s.finalScore ?? aiScore;
            const maxScore   = s.maxScore   ?? s.questions.reduce((sum, q) => sum + q.maxScore, 0);

            return (
              <div
                key={s.id}
                className={`pb-6 ${idx < students.length - 1 ? "border-b border-gray-200 mb-6" : ""}`}
              >

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 leading-tight">{s.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{s.date}</p>
                  </div>
                  {maxScore > 0 && (
                    <div className="flex items-center gap-3 text-sm font-medium shrink-0 ml-6">
                      <span className="text-blue-600">{aiScore} / {maxScore}</span>
                      <div className="h-4 w-px bg-gray-300" />
                      <span className="text-green-600">{finalScore} / {maxScore}</span>
                    </div>
                  )}
                </div>

                {s.aiFeedback && (
                  <div className="mb-3">
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">AI Feedback:</label>
                    <div className="p-3 border border-blue-200 rounded-lg text-sm text-gray-700 bg-white">
                      {s.aiFeedback}
                    </div>
                  </div>
                )}

                {s.finalFeedback && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Final Feedback:</label>
                    <div className="p-3 border border-green-200 rounded-lg text-sm text-gray-700 bg-white">
                      {s.finalFeedback}
                    </div>
                  </div>
                )}

                {!s.aiFeedback && !s.finalFeedback && (
                  <p className="text-sm text-gray-400 italic">Not yet graded</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-6 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
export const GradeModal = ({ assignment, students, onClose, onGrade }) => {
  useScrollLock();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
        variants={modalVariants} initial="hidden" animate="visible" exit="hidden"
        onClick={(e) => e.stopPropagation()}
      >
     
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Start Grading</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500">Begin AI-assisted grading for this assignment</p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-4 space-y-3">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">{s.name}</h4>
                <p className="text-sm text-gray-500">Submitted: {s.date}</p>
              </div>
              <div>
                {s.status === "Not Graded" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
                    <Clock size={12} /> Not Graded
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-green-200 bg-green-100 text-green-800 text-xs font-medium">
                    <CheckCircle size={12} /> Graded
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onGrade}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
          >
            Grade
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};