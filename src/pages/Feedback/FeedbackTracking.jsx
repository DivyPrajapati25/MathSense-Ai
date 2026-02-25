import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Download, CircleCheck, Clock, ChevronDown } from "lucide-react";
import { cardVariants, staggerContainer } from "../../utils/animations";

const STUDENTS = [
  {
    id: "emma",
    initials: "EJ",
    name: "Emma Johnson",
    score: 92,
    status: "Viewed",
    statusColor: "bg-green-100 text-green-800",
    StatusIcon: CircleCheck,
    statusIconColor: "text-green-600",
    parentNotified: true,
  },
  {
    id: "marcus",
    initials: "MW",
    name: "Marcus Williams",
    score: 68,
    status: "Pending",
    statusColor: "bg-gray-100 text-gray-600",
    StatusIcon: Clock,
    statusIconColor: "text-gray-500",
    parentNotified: true,
  },
  {
    id: "sophia",
    initials: "SC",
    name: "Sophia Chen",
    score: 88,
    status: "Viewed",
    statusColor: "bg-green-100 text-green-800",
    StatusIcon: CircleCheck,
    statusIconColor: "text-green-600",
    parentNotified: false,
  },
];

const Badges = ({ student }) => (
  <>
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${student.statusColor}`}>
      <student.StatusIcon className={`w-3 h-3 ${student.statusIconColor}`} />
      {student.status}
    </span>
    {student.parentNotified && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
        Parent Notified
      </span>
    )}
  </>
);

const StudentRow = ({ student }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-gray-50 rounded-lg overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
       
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {student.initials}
          </div>

          <div className="flex-1 min-w-0">
     
            <h4 className="font-medium text-sm mb-0.5 truncate">{student.name}</h4>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Score: {student.score}%</span>
             
              <span className="hidden md:contents">
                <Badges student={student} />
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <motion.div
          className="md:hidden shrink-0 ml-2 text-gray-400"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden md:hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
         
              <div>
                <p className="text-xs text-gray-500 mb-1">Score</p>
                <p className="text-3xl font-bold text-green-600">{student.score}%</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  <Badges student={student} />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FeedbackTracking = () => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className="bg-white rounded-xl border border-gray-200 p-6"
  >
    <h3 className="text-xl font-bold mb-6">Feedback Tracking</h3>

    <motion.div
      className="space-y-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {STUDENTS.map((student) => (
        <StudentRow key={student.id} student={student} />
      ))}
    </motion.div>
  </motion.div>
);

export default FeedbackTracking;