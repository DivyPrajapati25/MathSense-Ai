import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cardVariants, staggerContainer } from "../../utils/animations";

const STATS = [
  { id: "sent", value: "127", label: "Feedback Sent", color: "text-blue-600", bar: false },
  { id: "opened", value: "112", label: "Opened by Students", color: "text-green-600", bar: true, barValue: 112, barMax: 127 },
  { id: "parent", value: "23", label: "Parent Responses", color: "text-purple-600", bar: false },
  { id: "followup", value: "8", label: "Follow-up Questions", color: "text-orange-500", bar: false },
  { id: "viewtime", value: "3.5 min", label: "Avg. View Time", color: "text-pink-600", bar: false },
];

const FeedbackOverview = () => (
  <section className="mb-10">
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-blue-200 p-6 bg-linear-to-r from-blue-50 to-green-50"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
        Feedback Engagement Overview
      </h2>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {STATS.map((stat) => (
          <motion.div
            key={stat.id}
            variants={cardVariants}
            className="text-center"
          >
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
              {stat.value}
            </div>

            <p className="text-gray-600 text-sm">{stat.label}</p>
            {stat.bar && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.barValue / stat.barMax) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </section>
);

export default FeedbackOverview;