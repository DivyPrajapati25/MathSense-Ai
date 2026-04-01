import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, sectionVariants } from "../../utils/animations";
import InsightsHero from "./InsightsHero";
import ClassroomPlus from "./ClassroomPlus";
import PerformanceTrends from "./PerformanceTrends";
import TopicPerformance from "./TopicPerformance";
import PredictiveInsights from "./PredictiveInsights";
import { getStandardDetail } from "../../services/teacherService";
import api from "../../services/api";

const InsightsPage = () => {
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [period, setPeriod] = useState("month");
  const [periodValue, setPeriodValue] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: use /student/standards → returns ALL classes 8-12 always
  // No longer depends on teacher having assignments in that class
  useEffect(() => {
    api.get("/student/standards").then((res) => {
      const stds = (res.data?.data?.standards ?? []).map((s) => ({
        id: s.id,           // ✅ student/standards uses "id" not "standard_id"
        standard: s.standard,
      }));
      setStandards(stds);
      if (stds.length > 0) setSelectedStandard(stds[0]);
    }).catch(() => {});
  }, []);

  // ✅ Fetch dashboard data when standard, period, or periodValue changes
  useEffect(() => {
    if (!selectedStandard) return;
    setIsLoading(true);
    getStandardDetail(selectedStandard.id, { trendType: period, value: periodValue })
      .then((res) => {
        setDashboardData(res.data?.data ?? null);
      }).catch(() => setDashboardData(null))
      .finally(() => setIsLoading(false));
  }, [selectedStandard, period, periodValue]);

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
          periodValue={periodValue}
          onPeriodValueChange={setPeriodValue}
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