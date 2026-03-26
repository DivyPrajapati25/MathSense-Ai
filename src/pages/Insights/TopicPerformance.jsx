import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { cardVariants, staggerContainer } from "../../utils/animations";

// ✅ CHANGED: uses real topic_performance[] from API
// topic_performance: [{ topic, avg_score }]
// ✅ REMOVED: donut chart — no difficulty distribution data in API

const TopicRow = ({ topic }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{topic.topic}</h4>
        <span className="text-lg font-bold">{topic.avg_score}%</span>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${
            topic.avg_score >= 75 ? "bg-green-500" :
            topic.avg_score >= 50 ? "bg-yellow-500" : "bg-red-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${topic.avg_score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  </div>
);

const TopicPerformance = ({ topicData = [], isLoading }) => (
  <div className="mb-12">
    <motion.div
      variants={cardVariants} initial="hidden" animate="visible"
      className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-gray-200"
    >
      <h3 className="text-xl font-bold">Topic Performance</h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : topicData.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          No topic data available yet.
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {topicData.map((topic) => (
            <motion.div key={topic.topic} variants={cardVariants}>
              <TopicRow topic={topic} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  </div>
);

export default TopicPerformance;