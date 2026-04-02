import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, Brain, X, Send, FileDown, Mail } from "lucide-react";
import { backdropVariants, modalVariants, staggerContainer, cardVariants } from "../../utils/animations";
import useScrollLock from "../../hooks/useScrollLock";

const STUDENTS = {
  all: [
    { id: "emma", initials: "EJ", avatarBg: "bg-green-500", name: "Emma Johnson", grade: "Grade 9", recent: 97, previous: 97, trend: "Consistent", trendColor: "text-gray-600 dark:text-gray-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["Algebra", "Fractions"], needsHelp: ["Geometry"] },
    { id: "marcus", initials: "MW", avatarBg: "bg-red-500", name: "Marcus Williams", grade: "Grade 9", recent: 65, previous: 72, trend: "Struggling", trendColor: "text-red-600 dark:text-red-400", risk: "High Risk", riskColor: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", strongIn: ["Geometry"], needsHelp: ["Fractions", "Algebra"], hasIntervention: true },
    { id: "liam", initials: "LA", avatarBg: "bg-blue-500", name: "Liam Anderson", grade: "Grade 7", recent: 100, previous: 100, trend: "Consistent", trendColor: "text-gray-600 dark:text-gray-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["All topics"], needsHelp: [] },
    { id: "sophia", initials: "SC", avatarBg: "bg-green-500", name: "Sophia Chen", grade: "Grade 10", recent: 88, previous: 89, trend: "Consistent", trendColor: "text-gray-600 dark:text-gray-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["All topics"], needsHelp: [] },
    { id: "noah", initials: "NJ", avatarBg: "bg-green-500", name: "Noah Jackson", grade: "Grade 10", recent: 94, previous: 88, trend: "Improving", trendColor: "text-green-600 dark:text-green-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["Geometry", "Equations"], needsHelp: ["Algebra"] },
    { id: "ava", initials: "AT", avatarBg: "bg-orange-500", name: "Ava Thompson", grade: "Grade 10", recent: 73, previous: 78, trend: "Struggling", trendColor: "text-red-600 dark:text-red-400", risk: "Medium Risk", riskColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300", strongIn: ["Word Problems"], needsHelp: ["Equations"] },
  ],
  class1: [
    { id: "emma", initials: "EJ", avatarBg: "bg-green-500", name: "Emma Johnson", grade: "Grade 9", recent: 97, previous: 97, trend: "Consistent", trendColor: "text-gray-600 dark:text-gray-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["Algebra", "Fractions"], needsHelp: ["Geometry"] },
    { id: "marcus", initials: "MW", avatarBg: "bg-red-500", name: "Marcus Williams", grade: "Grade 9", recent: 65, previous: 72, trend: "Struggling", trendColor: "text-red-600 dark:text-red-400", risk: "High Risk", riskColor: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", strongIn: ["Geometry"], needsHelp: ["Fractions", "Algebra"], hasIntervention: true },
    { id: "ava", initials: "AT", avatarBg: "bg-orange-500", name: "Ava Thompson", grade: "Grade 10", recent: 73, previous: 78, trend: "Struggling", trendColor: "text-red-600 dark:text-red-400", risk: "Medium Risk", riskColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300", strongIn: ["Word Problems"], needsHelp: ["Equations"] },
  ],
  class2: [
    { id: "sophia", initials: "SC", avatarBg: "bg-green-500", name: "Sophia Chen", grade: "Grade 10", recent: 88, previous: 89, trend: "Consistent", trendColor: "text-gray-600 dark:text-gray-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["All topics"], needsHelp: [] },
    { id: "noah", initials: "NJ", avatarBg: "bg-green-500", name: "Noah Jackson", grade: "Grade 10", recent: 94, previous: 88, trend: "Improving", trendColor: "text-green-600 dark:text-green-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["Geometry", "Equations"], needsHelp: ["Algebra"] },
    { id: "liam", initials: "LA", avatarBg: "bg-blue-500", name: "Liam Anderson", grade: "Grade 7", recent: 100, previous: 100, trend: "Consistent", trendColor: "text-gray-600 dark:text-gray-400", risk: "Low Risk", riskColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", strongIn: ["All topics"], needsHelp: [] },
  ],
};

const PRACTICE_UNITS = [
  { title: "Unit 1: Algebra Fundamentals", items: ["Worksheet 3: Linear Equation Practice", "Chapter 1 Review Questions: Problems 15-25", "Practice Set A: Word Problem Applications"] },
  { title: "Unit 2: Geometry Basics", items: ["Interactive Diagrams: Parallel Lines and Transversals", "Problem Set 4: Angle Relationships", "Geometry Guide: Section 2.3 Exercises"] },
  { title: "Unit 3: Problem-Solving Strategies", items: ["Strategic Thinking Worksheet", "Mixed Review: Questions 8, 12, 17", "Challenge Problems: Extension Activities"] },
];

const ONLINE_RESOURCES = [
  { title: "Khan Academy", items: ["Algebra: Linear Equations and Inequalities", "Geometry: Angle Relationships", "Problem Solving: Multi-step Word Problems"] },
  { title: "IXL Math", items: ["Grade 9: Algebra Skills Practice", "Geometry: Angle Measures", "Word Problems: Real-world Applications"] },
  { title: "Additional Resources", items: ["Desmos Calculator: Interactive Graphing", "Math Playground: Problem-Solving Games", "Video Tutorials: Concept Review"] },
];

const ViewProfileModal = ({ student, onClose }) => {
  useScrollLock();
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [onClose]);
  const needsHelpText = student.needsHelp.length > 0 ? student.needsHelp.join(", ") : "various topics";

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose} />
      <motion.div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-card)] rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-[calc(100%-2rem)] sm:max-w-xl max-h-[90vh] flex flex-col"
        variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-semibold leading-snug mb-1 text-[var(--color-text-primary)]">{student.name}&apos;s Personalized Learning Plan</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Customized recommendations based on performance</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-6 py-2">
            <div>
              <h4 className="font-bold mb-3 flex items-center text-base text-[var(--color-text-primary)]"><BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />Practice Recommendations</h4>
              <div className="space-y-3">
                {PRACTICE_UNITS.map((unit) => (
                  <div key={unit.title} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">{unit.title}</h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">{unit.items.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3 flex items-center text-base text-[var(--color-text-primary)]"><ExternalLink className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />Online Resources</h4>
              <div className="space-y-3">
                {ONLINE_RESOURCES.map((res) => (
                  <div key={res.title} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="font-medium text-green-900 dark:text-green-200 mb-2">{res.title}</h5>
                    <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">{res.items.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-purple-900 dark:text-purple-200 mb-1">Personalization Note</h5>
                <p className="text-sm text-purple-800 dark:text-purple-300">Based on {student.name}&apos;s learning style and challenges with {needsHelpText}, these resources emphasize visual learning and step-by-step problem breakdown.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex justify-end">
          <button onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors">Close</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-opacity focus:outline-none" aria-label="Close"><X className="w-4 h-4" /></button>
      </motion.div>
    </>
  );
};

const TakeActionModal = ({ student, onClose }) => {
  useScrollLock();
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [onClose]);
  const defaultMsg = `Schedule 1-on-1 session with ${student.name}`;
  const [message, setMessage] = useState(defaultMsg);

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose} />
      <motion.div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-card)] rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col"
        variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-semibold leading-none mb-1 text-[var(--color-text-primary)]">Take Action</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Intervention for {student.name}</p>
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
                  <label className="flex items-center gap-2 text-sm font-medium leading-none mb-2 select-none text-[var(--color-text-primary)]">Additional Message (Optional)</label>
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
                  <li>• Student&apos;s current performance metrics</li><li>• Specific practice recommendations</li><li>• Online resource links</li><li>• Personalized learning path</li>
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

const StudentCard = ({ student, onViewProfile, onIntervene }) => (
  <motion.div variants={cardVariants} className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4 md:p-6 flex flex-col gap-4">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center space-x-3 md:space-x-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${student.avatarBg}`}>{student.initials}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm md:text-base text-[var(--color-text-primary)]">{student.name}</h3>
            <span className="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">{student.grade}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
            <span>Recent: {student.recent}%</span>
            <span className="hidden sm:inline">Previous: {student.previous}%</span>
            <span className={`font-medium ${student.trendColor}`}>
              {student.trend === "Improving" ? "↗ " : student.trend === "Struggling" ? "↘ " : "→ "}{student.trend}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${student.riskColor}`}>{student.risk}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onViewProfile(student)}
            className="inline-flex items-center justify-center h-8 px-3 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors min-h-[44px]">
            <span className="hidden sm:inline">View Profile</span><span className="sm:hidden">View</span>
          </button>
          {student.hasIntervention && (
            <button onClick={() => onIntervene(student)}
              className="inline-flex items-center justify-center h-8 px-3 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors min-h-[44px]">Intervene</button>
          )}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {student.strongIn.length > 0 && (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Strong in:</p>
          <div className="flex flex-wrap gap-1">
            {student.strongIn.map((tag) => <span key={tag} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">{tag}</span>)}
          </div>
        </div>
      )}
      {student.needsHelp.length > 0 && (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Needs help with:</p>
          <div className="flex flex-wrap gap-1">
            {student.needsHelp.map((tag) => <span key={tag} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">{tag}</span>)}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

const StudentRiskAssessment = ({ selectedClass = "all" }) => {
  const [profileStudent, setProfileStudent] = useState(null);
  const [interveneStudent, setInterveneStudent] = useState(null);
  const students = STUDENTS[selectedClass] ?? STUDENTS.all;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">Student Risk Assessment</h2>
      <motion.div className="grid gap-4" variants={staggerContainer} initial="hidden" animate="visible" key={selectedClass}>
        {students.map((student) => (
          <StudentCard key={student.id} student={student} onViewProfile={setProfileStudent} onIntervene={setInterveneStudent} />
        ))}
      </motion.div>
      <AnimatePresence>{profileStudent && <ViewProfileModal student={profileStudent} onClose={() => setProfileStudent(null)} />}</AnimatePresence>
      <AnimatePresence>{interveneStudent && <TakeActionModal student={interveneStudent} onClose={() => setInterveneStudent(null)} />}</AnimatePresence>
    </section>
  );
};

export default StudentRiskAssessment;