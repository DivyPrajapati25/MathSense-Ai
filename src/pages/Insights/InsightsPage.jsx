import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, sectionVariants } from "../../utils/animations";
import InsightsHero from "./InsightsHero";
import ClassroomPlus from "./ClassroomPlus";
import PerformanceTrends from "./PerformanceTrends";
import TopicPerformance from "./TopicPerformance";
import PredictiveInsights from "./PredictiveInsights";
import api from "../../services/api";

const InsightsPage = () => {
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [period, setPeriod] = useState("month");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ CHANGED: use /student/standards → returns ALL classes always
  useEffect(() => {
    api.get("/student/standards").then((res) => {
      const stds = res.data?.data?.standards ?? [];
      setStandards(stds);
      if (stds.length > 0) setSelectedStandard(stds[0]);
    }).catch(() => {});
  }, []);

  // ✅ Fetch dashboard data when standard OR period changes
  // Note: teacher/dashboard uses standard_id but student/standards uses id
  useEffect(() => {
    if (!selectedStandard) return;
    setIsLoading(true);
    api.get(`/teacher/dashboard/${selectedStandard.id}`, {
      params: { trend_type: period, value: 1 }
    }).then((res) => {
      setDashboardData(res.data?.data ?? null);
    }).catch(() => setDashboardData(null))
      .finally(() => setIsLoading(false));
  }, [selectedStandard, period]);

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={sectionVariants}>
        <InsightsHero
          standards={standards}
          selectedStandard={selectedStandard}
          onStandardChange={setSelectedStandard}
          period={period}
          onPeriodChange={setPeriod}
        />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <ClassroomPlus
          dashboardData={dashboardData}
          isLoading={isLoading}
          standardNumber={selectedStandard?.standard}
        />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PerformanceTrends
          trendData={dashboardData?.trend ?? []}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <TopicPerformance
          topicData={dashboardData?.standard?.topic_performance ?? []}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PredictiveInsights
          dashboardData={dashboardData?.standard}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
};

export default InsightsPage;