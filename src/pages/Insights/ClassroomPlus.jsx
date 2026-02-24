import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, TriangleAlert, TrendingUp } from "lucide-react";
import { staggerContainer, cardVariants } from "../../utils/animations";

const PULSE_DATA = {
  all: {
    Week: {
      performance: { value: "84.7%", badge: "+6%", sub: "27 students" },
      topics:      { value: "12",    badge: "Strong", label: "Topics Mastered This Week" },
      alerts:      { value: "Early", badge: "4 Alerts" },
    },
    Month: {
      performance: { value: "82.3%", badge: "+4%", sub: "27 students" },
      topics:      { value: "38",    badge: "Strong", label: "Topics Mastered This Month" },
      alerts:      { value: "Early", badge: "6 Alerts" },
    },
  },
  class1: {
    Week: {
      performance: { value: "82.0%", badge: "+4%", sub: "14 students" },
      topics:      { value: "8",     badge: "Strong", label: "Topics Mastered This Week" },
      alerts:      { value: "Early", badge: "2 Alerts" },
    },
    Month: {
      performance: { value: "80.5%", badge: "+3%", sub: "14 students" },
      topics:      { value: "20",    badge: "Strong", label: "Topics Mastered This Month" },
      alerts:      { value: "Early", badge: "3 Alerts" },
    },
  },
  class2: {
    Week: {
      performance: { value: "87.4%", badge: "+8%", sub: "13 students" },
      topics:      { value: "9",     badge: "Strong", label: "Topics Mastered This Week" },
      alerts:      { value: "Early", badge: "2 Alerts" },
    },
    Month: {
      performance: { value: "85.1%", badge: "+6%", sub: "13 students" },
      topics:      { value: "22",    badge: "Strong", label: "Topics Mastered This Month" },
      alerts:      { value: "Early", badge: "3 Alerts" },
    },
  },
};

const ClassroomPulse = ({ selectedClass = "all", period = "Month" }) => {
  const data = PULSE_DATA[selectedClass]?.[period] ?? PULSE_DATA.all.Month;

  const CARDS = [
    {
      id: "performance",
      cardBg: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      iconBg: "bg-blue-500",
      Icon: Users,
      badge: data.performance.badge,
      badgeColor: "bg-blue-100 text-blue-800",
      value: data.performance.value,
      valueColor: "text-blue-700",
      label: "Average Class Performance",
      sub: data.performance.sub,
      subColor: "text-blue-500",
    },
    {
      id: "topics",
      cardBg: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      iconBg: "bg-green-500",
      Icon: BookOpen,
      badge: data.topics.badge,
      badgeColor: "bg-green-100 text-green-800",
      value: data.topics.value,
      valueColor: "text-green-700",
      label: data.topics.label,
      sub: null,
    },
    {
      id: "alerts",
      cardBg: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
      iconBg: "bg-orange-500",
      Icon: TriangleAlert,
      badge: data.alerts.badge,
      badgeColor: "bg-orange-100 text-orange-800",
      value: data.alerts.value,
      valueColor: "text-orange-700",
      label: "Intervention Alerts",
      sub: null,
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

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={`${selectedClass}-${period}`}
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

            <AnimatePresence mode="wait">
              <motion.div
                key={c.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={`text-3xl font-bold mb-1 ${c.valueColor}`}
              >
                {c.value}
              </motion.div>
            </AnimatePresence>

            <div>
              <p className={`${c.valueColor} text-sm font-medium`}>{c.label}</p>
              {c.sub && <p className={`text-xs mt-1 ${c.subColor}`}>{c.sub}</p>}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default ClassroomPulse;