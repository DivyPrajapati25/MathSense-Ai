import { motion } from "framer-motion";
// import ClassManagement from "./ClassManagement/ClassManagement";
// import UploadZone from "./UploadZone/UploadZone";
// import CommonErrors from "./CommonErrors/CommonErrors";
import Assignments from "./AssignmentCard/AssignmentCard";
import { sectionVariants, staggerContainer } from "../../utils/animations";

const Dashboard = () => {
  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* <motion.div variants={sectionVariants}><ClassManagement /></motion.div> */}
      {/* <motion.div variants={sectionVariants}><UploadZone /></motion.div> */}
      {/* <motion.div variants={sectionVariants}><CommonErrors /></motion.div> */}
      <motion.div variants={sectionVariants}><Assignments /></motion.div>
    </motion.div>
  );
};

export default Dashboard;