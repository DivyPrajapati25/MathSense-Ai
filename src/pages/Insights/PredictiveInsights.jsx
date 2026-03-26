import { motion } from "framer-motion";
import { Brain, Loader } from "lucide-react";
import { cardVariants, staggerContainer } from "../../utils/animations";

// ✅ CHANGED: uses real API data
// dashboardData: { likely_to_struggle_students, ready_to_advance_students }
// ✅ REMOVED: hardcoded names, intervention rate, ViewDetailsModal — no API data
const PredictiveInsights = ({ dashboardData, isLoading }) => {
  const struggling = dashboardData?.likely_to_struggle_students ?? 0;
  const advancing  = dashboardData?.ready_to_advance_students ?? 0;

  return (
    <section className="mb-12">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-purple-200 p-6 bg-linear-to-r from-purple-50 to-blue-50 flex flex-col gap-6"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Predictive Insights</h2>
            <p className="text-gray-600 text-sm">AI-powered predictions for students</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* ✅ Likely to Struggle */}
            <motion.div variants={cardVariants} className="bg-white rounded-lg p-5">
              <h4 className="font-bold mb-2 text-orange-700">Likely to Struggle</h4>
              <div className="text-3xl font-bold text-orange-600 mb-1">{struggling}</div>
              <p className="text-sm text-gray-600">
                {struggling === 0
                  ? "No students are predicted to struggle."
                  : `${struggling} student${struggling > 1 ? "s" : ""} may need extra support.`}
              </p>
            </motion.div>

            {/* ✅ Ready to Advance */}
            <motion.div variants={cardVariants} className="bg-white rounded-lg p-5">
              <h4 className="font-bold mb-2 text-green-700">Ready to Advance</h4>
              <div className="text-3xl font-bold text-green-600 mb-1">{advancing}</div>
              <p className="text-sm text-gray-600">
                {advancing === 0
                  ? "No students are ready to advance yet."
                  : `${advancing} student${advancing > 1 ? "s" : ""} have strong foundation for next concepts.`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default PredictiveInsights;