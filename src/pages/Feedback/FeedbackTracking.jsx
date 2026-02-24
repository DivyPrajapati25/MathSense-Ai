import { motion } from "framer-motion";
import { Eye, Download, CircleCheck, Clock } from "lucide-react";
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

const StudentRow = ({ student }) => (
  <motion.div
    variants={cardVariants}
    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
  >

    <div className="flex items-center gap-3 flex-1 min-w-0">

      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
        {student.initials}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm mb-0.5">{student.name}</h4>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Score: {student.score}%</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${student.statusColor}`}
          >
            <student.StatusIcon className={`w-3 h-3 ${student.statusIconColor}`} />
            {student.status}
          </span>

          {student.parentNotified && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              Parent Notified
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0 ml-2">
      <button className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <Eye className="w-4 h-4" />
        View
      </button>
      <button className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  </motion.div>
);

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