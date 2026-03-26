import { motion } from "framer-motion";
import { Users, BookOpen, TriangleAlert, TrendingUp, Loader } from "lucide-react";
import { staggerContainer, cardVariants } from "../../utils/animations";

// ✅ CHANGED: uses real API data instead of hardcoded PULSE_DATA
const ClassroomPlus = ({ dashboardData, isLoading, standardNumber }) => {

  // ✅ Real data from API
  const performance = dashboardData?.standard?.average_class_performance ?? 0;
  const topicCount  = dashboardData?.standard?.topic_performance?.length ?? 0;
  const struggling  = dashboardData?.standard?.likely_to_struggle_students ?? 0;

  const CARDS = [
    {
      id: "performance",
      cardBg: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      iconBg: "bg-blue-500",
      Icon: Users,
      badge: standardNumber ? `Class ${standardNumber}` : "—",
      badgeColor: "bg-blue-100 text-blue-800",
      value: `${performance}%`,
      valueColor: "text-blue-700",
      label: "Average Class Performance",
    },
    {
      id: "topics",
      cardBg: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      iconBg: "bg-green-500",
      Icon: BookOpen,
      badge: "Topics",
      badgeColor: "bg-green-100 text-green-800",
      value: topicCount,
      valueColor: "text-green-700",
      label: "Topics Covered",
    },
    {
      id: "alerts",
      cardBg: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
      iconBg: "bg-orange-500",
      Icon: TriangleAlert,
      badge: struggling > 0 ? `${struggling} students` : "None",
      badgeColor: "bg-orange-100 text-orange-800",
      value: struggling,
      valueColor: "text-orange-700",
      label: "Likely to Struggle",
    },
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        Classroom Pulse
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {CARDS.map((c) => (
            <motion.div
              key={c.id}
              variants={cardVariants}
              className={`rounded-xl border p-6 flex flex-col gap-6 ${c.cardBg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center`}>
                  <c.Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ${c.badgeColor}`}>
                  {c.badge}
                </span>
              </div>
              <div className={`text-3xl font-bold mb-1 ${c.valueColor}`}>
                {c.value}
              </div>
              <p className={`${c.valueColor} text-sm font-medium`}>{c.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default ClassroomPlus;