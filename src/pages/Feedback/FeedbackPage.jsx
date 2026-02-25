import { motion } from "framer-motion";
import { staggerContainer, sectionVariants } from "../../utils/animations";
import FeedbackHero from "./FeedbackHero";
import FeedbackEngagementOverview from "./FeedbackOverview";
import FeedbackStyles from "./FeedbackStyles";
import FeedbackPreview from "./FeedbackPreview";
import DeliveryOptions from "./DeliveryOptions";
import FeedbackTracking from "./FeedbackTracking";

const FeedbackPage = () => (
  <motion.div
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
  >
    <motion.div variants={sectionVariants}>
      <FeedbackHero />
    </motion.div>

    <motion.div variants={sectionVariants}>
      <FeedbackEngagementOverview />
    </motion.div>
    <motion.div variants={sectionVariants}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

        <div className="lg:col-span-1 self-start lg:sticky lg:top-8">
          <FeedbackStyles />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
          <FeedbackPreview />
          <DeliveryOptions />
          <FeedbackTracking />
        </div>

      </div>
    </motion.div>
  </motion.div>
);

export default FeedbackPage;