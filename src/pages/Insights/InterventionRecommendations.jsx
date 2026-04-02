import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, Send, FileDown, Mail, X } from "lucide-react";
import { staggerContainer, cardVariants, backdropVariants, modalVariants } from "../../utils/animations";

const RECOMMENDATIONS = {
  all: [
    { id: "marcus", title: "Marcus Williams needs immediate support", impactLabel: "High Impact", impactColor: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", studentCount: "1 student", desc: "Declining performance in fractions and algebra", recommended: "Schedule 1-on-1 session", borderColor: "border-red-500", bgColor: "bg-red-50 dark:bg-red-900/20", btnColor: "bg-red-600 hover:bg-red-700", studentName: "Marcus Williams" },
    { id: "geometry", title: "Combined classes showing geometry variation", impactLabel: "Medium Impact", impactColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300", studentCount: "15 students", desc: "Opportunity for peer learning", recommended: "Cross-class study groups", borderColor: "border-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", btnColor: "bg-orange-600 hover:bg-orange-700", studentName: "All Classes" },
    { id: "equations", title: "Overall equations performance strong", impactLabel: "Medium Impact", impactColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", studentCount: "23 students", desc: "88% average across both classes", recommended: "Continue current approach", borderColor: "border-green-500", bgColor: "bg-green-50 dark:bg-green-900/20", btnColor: "bg-green-600 hover:bg-green-700", studentName: "All Classes" },
  ],
  class1: [
    { id: "marcus", title: "Marcus Williams needs immediate support", impactLabel: "High Impact", impactColor: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", studentCount: "1 student", desc: "Declining performance in fractions and algebra", recommended: "Schedule 1-on-1 session", borderColor: "border-red-500", bgColor: "bg-red-50 dark:bg-red-900/20", btnColor: "bg-red-600 hover:bg-red-700", studentName: "Marcus Williams" },
    { id: "algebra", title: "Word problems improving across Class 1", impactLabel: "Medium Impact", impactColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300", studentCount: "14 students", desc: "34% improvement this month", recommended: "Share successful strategies", borderColor: "border-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", btnColor: "bg-orange-600 hover:bg-orange-700", studentName: "Class 1" },
    { id: "algebra-strong", title: "Strong algebra progress overall", impactLabel: "Medium Impact", impactColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", studentCount: "14 students", desc: "15% improvement — class excelling", recommended: "Continue current approach", borderColor: "border-green-500", bgColor: "bg-green-50 dark:bg-green-900/20", btnColor: "bg-green-600 hover:bg-green-700", studentName: "Class 1" },
  ],
  class2: [
    { id: "geometry2", title: "Geometry scores dipping in Class 2", impactLabel: "Medium Impact", impactColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300", studentCount: "13 students", desc: "Slight decline over the last two weeks", recommended: "Add geometry revision exercises", borderColor: "border-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", btnColor: "bg-orange-600 hover:bg-orange-700", studentName: "Class 2" },
    { id: "equations2", title: "Overall equations performance strong", impactLabel: "Medium Impact", impactColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", studentCount: "13 students", desc: "90% average — best performing topic", recommended: "Continue current approach", borderColor: "border-green-500", bgColor: "bg-green-50 dark:bg-green-900/20", btnColor: "bg-green-600 hover:bg-green-700", studentName: "Class 2" },
  ],
};

const TakeActionModal = ({ rec, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const defaultMsg = `Recommended action: ${rec.recommended} for ${rec.studentName}`;
  const [message, setMessage] = useState(defaultMsg);

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose} />
      <motion.div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-card)] rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col"
        variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-semibold leading-none mb-1 text-[var(--color-text-primary)]">Take Action</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{rec.title}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-6 py-2">
            <div>
              <h4 className="font-bold mb-3 flex items-center text-base text-[var(--color-text-primary)]"><Send className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />Send Message</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{defaultMsg}</p>
                </div>
                <div>
                  <label className="text-sm font-medium leading-none mb-2 select-none block text-[var(--color-text-primary)]">Additional Message (Optional)</label>
                  <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add any additional notes..."
                    className="resize-none w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors mt-1" />
                </div>
                <button className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"><Send className="w-4 h-4" />Send Message</button>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3 flex items-center text-base text-[var(--color-text-primary)]"><FileDown className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />Export &amp; Share</h4>
              <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg space-y-3">
                <p className="text-sm text-[var(--color-text-secondary)]">Generate comprehensive feedback PDF including:</p>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1 ml-1">
                  <li>• Student's current performance metrics</li><li>• Specific practice recommendations</li><li>• Online resource links</li><li>• Personalized learning path</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors"><FileDown className="w-4 h-4" />Download PDF</button>
                  <button className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors"><Mail className="w-4 h-4" />Email to Student</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors">Cancel</button>
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">Complete Action</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-opacity focus:outline-none" aria-label="Close"><X className="w-4 h-4" /></button>
      </motion.div>
    </>
  );
};

const RecCard = ({ rec, onAction }) => (
  <motion.div variants={cardVariants}
    className={`rounded-xl border-l-4 border border-[var(--color-border)] p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${rec.borderColor} ${rec.bgColor}`}>
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
        <h3 className="font-bold text-sm md:text-base text-[var(--color-text-primary)]">{rec.title}</h3>
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${rec.impactColor}`}>{rec.impactLabel}</span>
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">{rec.studentCount}</span>
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm mb-2">{rec.desc}</p>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">Recommended action: {rec.recommended}</p>
    </div>
    <div className="shrink-0">
      <button onClick={() => onAction(rec)}
        className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white transition-colors min-h-[44px] w-full md:w-auto ${rec.btnColor}`}>
        Take Action <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  </motion.div>
);

const InterventionRecommendations = ({ selectedClass = "all" }) => {
  const [activeRec, setActiveRec] = useState(null);
  const recs = RECOMMENDATIONS[selectedClass] ?? RECOMMENDATIONS.all;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-[var(--color-text-primary)]">
        <Lightbulb className="w-6 h-6 mr-3 text-yellow-500" /> Intervention Recommendations
      </h2>
      <motion.div className="grid gap-4" variants={staggerContainer} initial="hidden" animate="visible" key={selectedClass}>
        {recs.map((rec) => <RecCard key={rec.id} rec={rec} onAction={setActiveRec} />)}
      </motion.div>
      <AnimatePresence>{activeRec && <TakeActionModal rec={activeRec} onClose={() => setActiveRec(null)} />}</AnimatePresence>
    </section>
  );
};

export default InterventionRecommendations;