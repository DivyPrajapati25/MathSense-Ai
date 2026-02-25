import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, sectionVariants } from "../../utils/animations";
import InsightsHero from "./InsightsHero";
import ClassroomPlus from "./ClassroomPlus";
import PerformanceTrends from "./PerformanceTrends";
import TopicPerformance from "./TopicPerformance";
import PredictiveInsights from "./PredictiveInsights";
import StudentRiskAssessment from "./StudentRiskAssessment";
import InterventionRecommendations from "./InterventionRecommendations";
import AIPerformanceMetrics from "./AiPerformanceMetrics";

const InsightsPage = () => {
  const [period, setPeriod] = useState("Month");
  const [selectedClass, setSelectedClass] = useState("all");

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={sectionVariants}>
        <InsightsHero
          period={period}
          onPeriodChange={setPeriod}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
        />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <ClassroomPlus selectedClass={selectedClass} period={period} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PerformanceTrends period={period} selectedClass={selectedClass} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <TopicPerformance selectedClass={selectedClass} period={period} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PredictiveInsights selectedClass={selectedClass} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <StudentRiskAssessment selectedClass={selectedClass} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <InterventionRecommendations selectedClass={selectedClass} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <AIPerformanceMetrics />
      </motion.div>

    </motion.div>
  );
};

export default InsightsPage;