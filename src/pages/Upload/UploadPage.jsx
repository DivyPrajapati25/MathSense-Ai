import { motion } from "framer-motion";
import { staggerContainer, sectionVariants } from "../../utils/animations";
import UploadHero from "./UploadHero";
import CreateNewAssignment from "./CreateNewAssignment";
import UploadZone from "./AssignmentUploadZone";
import UnitTeachingMaterials from "./UnitTeachingMaterials";
import RecentAssignments from "./RecentAssignments";


const UploadPage = () => (
  <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 pb-16">
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={sectionVariants}>
        <UploadHero />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <CreateNewAssignment />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <UploadZone />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <UnitTeachingMaterials />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <RecentAssignments />
      </motion.div>


    </motion.div>
  </div>
);

export default UploadPage;