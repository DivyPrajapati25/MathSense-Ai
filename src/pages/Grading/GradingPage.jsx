import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Users, Calendar, Eye } from "lucide-react";
import { sectionVariants, staggerContainer, cardVariants } from "../../utils/animations";
import { ASSIGNMENTS, ASSIGNMENT_DETAIL, STATUS_STYLES } from "./GradingData";
import { GradeModal, ProcessingModal, ViewDetailsModal } from "./GradingModals";
import GradingDetailPage, { StatusBadge } from "./GradingDetailsPage";



const AssignmentCard = ({ assignment, onGrade, onView }) => (
  <motion.div
    variants={cardVariants}
    className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-medium text-gray-900 mb-2">{assignment.title}</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
          <StatusBadge status={assignment.status} />
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4 text-orange-500" /> {assignment.points} points
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" /> {assignment.submissions} submissions
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" /> {assignment.date}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onGrade(assignment)}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors whitespace-nowrap w-full sm:w-auto"
        >
          Grade
        </button>
        <button
          onClick={() => onView(assignment)}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap w-full sm:w-auto"
        >
          <Eye className="w-4 h-4" /> View Details
        </button>
      </div>
    </div>
  </motion.div>
);

const GradingPage = () => {
  const [gradeModal, setGradeModal] = useState(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  const handleGradeClick = (assignment) => setGradeModal(assignment);

  const handleViewDetails = (assignment) => setViewModal(assignment);

  const handleStartGrade = () => {
    setPendingAssignment(gradeModal);
    setGradeModal(null);
    setShowProcessing(true);
  };

  const handleProcessingComplete = () => {
    setShowProcessing(false);
    setDetailAssignment(pendingAssignment || ASSIGNMENTS[0]);
    setPendingAssignment(null);
  };

  const handleSwitchAssignment = (id) => {
    const found = ASSIGNMENTS.find((a) => a.id === id);
    if (found) setDetailAssignment(found);
  };

  if (detailAssignment) {
    return (
      <GradingDetailPage
        assignment={detailAssignment}
        allAssignments={ASSIGNMENTS}
        onBack={() => setDetailAssignment(null)}
        onSwitchAssignment={handleSwitchAssignment}
      />
    );
  }

  const gradeModalStudents = gradeModal
    ? (ASSIGNMENT_DETAIL[gradeModal.id]?.students || [])
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <motion.div
        className="text-center mb-12"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent pb-2 px-1">
          Select Assignment to Grade
        </h1>
        <p className="text-xl text-gray-600">Choose an assignment to begin AI-assisted grading</p>
      </motion.div>

      <motion.div
        className="grid gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {ASSIGNMENTS.map((a) => (
          <AssignmentCard
            key={a.id}
            assignment={a}
            onGrade={handleGradeClick}
            onView={handleViewDetails}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {gradeModal && (
          <GradeModal
            key="grade-modal"
            assignment={gradeModal}
            students={gradeModalStudents}
            onClose={() => setGradeModal(null)}
            onGrade={handleStartGrade}
          />
        )}
        {showProcessing && (
          <ProcessingModal
            key="processing"
            onComplete={handleProcessingComplete}
          />
        )}
        {viewModal && (
          <ViewDetailsModal
            key="view-details"
            assignment={viewModal}
            students={ASSIGNMENT_DETAIL[viewModal.id]?.students || []}
            onClose={() => setViewModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradingPage;