import { motion } from "framer-motion";
import { sectionVariants } from "../../utils/animations";

const FeedbackHero = () => (
  <motion.div
    className="text-center py-8"
    variants={sectionVariants}
    initial="hidden"
    animate="visible"
  >
    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent pb-2 px-1">
      Student Engagement Made Easy
    </h1>
    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
      Personalized feedback that motivates learning and keeps parents informed
    </p>
  </motion.div>
);

export default FeedbackHero;