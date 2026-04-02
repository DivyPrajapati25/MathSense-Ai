import { motion } from "framer-motion";
import { sectionVariants } from "../../utils/animations";

const UploadHero = () => (
  <motion.div
    className="text-center py-8"
    variants={sectionVariants}
    initial="hidden"
    animate="visible"
  >
    <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent pb-2 px-1">
      Effortless Efficiency
    </h1>
    <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
      Transform your grading workflow with AI-powered intelligence
    </p>
  </motion.div>
);

export default UploadHero;