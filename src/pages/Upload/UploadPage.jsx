import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // ✅ added
import { motion } from "framer-motion";
import { staggerContainer, sectionVariants } from "../../utils/animations";
import UploadHero from "./UploadHero";
import CreateNewAssignment from "./CreateNewAssignment";
// import UploadZone from "./AssignmentUploadZone";
// import UnitTeachingMaterials from "./UnitTeachingMaterials";
import RecentAssignments from "./RecentAssignments";

const UploadPage = () => {
  const location = useLocation(); // ✅ read navigation state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // ✅ CHANGED: read reuploadName from navigation state (passed by YourAssignments retry)
  const [reuploadName, setReuploadName] = useState(location.state?.reuploadName ?? "");

  // ✅ Clear navigation state after reading so refresh doesn't re-open modal
  useEffect(() => {
    if (location.state?.reuploadName) {
      window.history.replaceState({}, "");
    }
  }, []);

  const handleAssignmentCreated = () => {
    setRefreshTrigger((p) => p + 1);
    setReuploadName("");
  };

  return (
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
        <CreateNewAssignment
          onAssignmentCreated={handleAssignmentCreated}
          reuploadName={reuploadName}
          onClearReupload={() => setReuploadName("")}
        />
      </motion.div>

      {/* <motion.div variants={sectionVariants}>
        <UploadZone />
      </motion.div> */}

      {/* <motion.div variants={sectionVariants}>
        <UnitTeachingMaterials />
      </motion.div> */}

      <motion.div variants={sectionVariants}>
        <RecentAssignments refreshTrigger={refreshTrigger} onReupload={(a) => setReuploadName(a.pdf_file_name)} />
      </motion.div>
    </motion.div>
  );
};

export default UploadPage;