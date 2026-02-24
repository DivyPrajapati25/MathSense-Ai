import { motion } from "framer-motion";
import { FileText, Clock, Play } from "lucide-react";
import { sectionVariants, staggerContainer, cardVariants } from "../../utils/animations";

const ASSIGNMENTS = [
  {
    id: 1,
    filename: "homework_sarah_m.pdf",
    subject: "Algebra",
    questions: 12,
    date: "Sep 28, 2025",
    status: "Uploaded",
  },
  {
    id: 2,
    filename: "quiz_david_l.pdf",
    subject: "Geometry",
    questions: 8,
    date: "Sep 27, 2025",
    status: "Uploaded",
  },
  {
    id: 3,
    filename: "worksheet_class_5a.pdf",
    subject: "Fractions",
    questions: 15,
    date: "Sep 26, 2025",
    status: "Queued",
  },
];

const StatusBadge = ({ status }) => {
  const isQueued = status === "Queued";
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium whitespace-nowrap
        ${isQueued
          ? "bg-gray-100 border-gray-200 text-gray-600"
          : "bg-gray-100 border-gray-200 text-gray-600"
        }
      `}
    >
      {status}
    </span>
  );
};

const AssignmentRow = ({ assignment }) => (
  <motion.div
    variants={cardVariants}
    className="
      flex items-center justify-between
      bg-white border border-gray-200 rounded-xl px-4 py-3
      hover:shadow-sm transition-shadow
    "
  >

    <div className="flex items-center gap-3 min-w-0">
  
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>

      <div className="min-w-0">
        <h4 className="font-medium text-base text-gray-900 truncate">{assignment.filename}</h4>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5 flex-wrap">
          <span>{assignment.subject}</span>
          <span>•</span>
          <span>{assignment.questions} questions</span>
          <span className="flex items-center gap-1 ml-1">
            <Clock className="w-3 h-3" />
            {assignment.date}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3 shrink-0 ml-4">
      <StatusBadge status={assignment.status} />
      <button className="
        inline-flex items-center gap-1.5 h-11 px-4 rounded-lg
        bg-green-600 hover:bg-green-700 text-white
        text-sm font-medium transition-colors whitespace-nowrap
      ">
        <Play className="w-4 h-4" />
        Grade Now
      </button>
    </div>
  </motion.div>
);

const RecentAssignments = () => (
  <motion.section
    className="mb-16"
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
  >
    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Recent Assignments</h2>

    <motion.div
      className="grid gap-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {ASSIGNMENTS.map((a) => (
        <AssignmentRow key={a.id} assignment={a} />
      ))}
    </motion.div>
  </motion.section>
);

export default RecentAssignments;