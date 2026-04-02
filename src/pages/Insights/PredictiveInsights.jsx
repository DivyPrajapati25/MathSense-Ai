import { motion } from "framer-motion";
import { Brain, Loader } from "lucide-react";
import { cardVariants, staggerContainer } from "../../utils/animations";

const PredictiveInsights = ({ dashboardData, isLoading }) => {
  const struggling = dashboardData?.likely_to_struggle_students ?? 0;
  const advancing  = dashboardData?.ready_to_advance_students ?? 0;

  return (
    <section className="mb-12">
      <motion.div variants={cardVariants} initial="hidden" animate="visible"
        className="rounded-xl border border-purple-200 dark:border-purple-800 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex flex-col gap-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Predictive Insights</h2>
            <p className="text-[var(--color-text-secondary)] text-sm">AI-powered predictions for students</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={cardVariants} className="bg-[var(--color-bg-card)] rounded-lg p-5 border border-[var(--color-border)]">
              <h4 className="font-bold mb-2 text-orange-700 dark:text-orange-400">Likely to Struggle</h4>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{struggling}</div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {struggling === 0 ? "No students are predicted to struggle." : `${struggling} student${struggling > 1 ? "s" : ""} may need extra support.`}
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="bg-[var(--color-bg-card)] rounded-lg p-5 border border-[var(--color-border)]">
              <h4 className="font-bold mb-2 text-green-700 dark:text-green-400">Ready to Advance</h4>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{advancing}</div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {advancing === 0 ? "No students are ready to advance yet." : `${advancing} student${advancing > 1 ? "s" : ""} have strong foundation for next concepts.`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default PredictiveInsights;