import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cardVariants, staggerContainer } from "../../utils/animations";

const TOPICS_DATA = {
  all: {
    Month: [
      { name: "Algebra",       score: 87, change: +18, students: 14 },
      { name: "Geometry",      score: 71, change:  -4, students: 14 },
      { name: "Fractions",     score: 83, change: +10, students: 13 },
      { name: "Word Problems", score: 76, change: +15, students: 14 },
      { name: "Equations",     score: 86, change: +12, students: 14 },
    ],
    Week: [
      { name: "Algebra",       score: 82, change: +10, students: 14 },
      { name: "Geometry",      score: 68, change:  -2, students: 14 },
      { name: "Fractions",     score: 79, change:  +6, students: 13 },
      { name: "Word Problems", score: 74, change:  +8, students: 14 },
      { name: "Equations",     score: 81, change:  +5, students: 14 },
    ],
  },
  class1: {
    Month: [
      { name: "Algebra",       score: 85, change: +15, students: 14 },
      { name: "Geometry",      score: 69, change:  -5, students: 14 },
      { name: "Fractions",     score: 80, change:  +8, students: 14 },
      { name: "Word Problems", score: 73, change: +12, students: 14 },
      { name: "Equations",     score: 84, change: +10, students: 14 },
    ],
    Week: [
      { name: "Algebra",       score: 80, change:  +8, students: 14 },
      { name: "Geometry",      score: 65, change:  -3, students: 14 },
      { name: "Fractions",     score: 76, change:  +4, students: 14 },
      { name: "Word Problems", score: 71, change:  +6, students: 14 },
      { name: "Equations",     score: 79, change:  +4, students: 14 },
    ],
  },
  class2: {
    Month: [
      { name: "Algebra",       score: 90, change: +20, students: 13 },
      { name: "Geometry",      score: 74, change:  -2, students: 13 },
      { name: "Fractions",     score: 87, change: +13, students: 13 },
      { name: "Word Problems", score: 80, change: +18, students: 13 },
      { name: "Equations",     score: 89, change: +14, students: 13 },
    ],
    Week: [
      { name: "Algebra",       score: 86, change: +12, students: 13 },
      { name: "Geometry",      score: 71, change:  -1, students: 13 },
      { name: "Fractions",     score: 82, change:  +8, students: 13 },
      { name: "Word Problems", score: 77, change: +10, students: 13 },
      { name: "Equations",     score: 84, change:  +7, students: 13 },
    ],
  },
};

const DONUT_DATA = {
  all:    { Easy: 47, Medium: 34, Hard: 19 },
  class1: { Easy: 44, Medium: 37, Hard: 19 },
  class2: { Easy: 50, Medium: 32, Hard: 18 },
};

const DONUT_COLORS = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };

const TopicRow = ({ topic }) => {
  const isUp = topic.change >= 0;
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">{topic.name}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{topic.score}%</span>
            <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium gap-1 ${isUp ? "bg-green-100 text-green-800 border-transparent" : "bg-red-100 text-red-800 border-transparent"}`}>
              {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isUp ? "+" : ""}{topic.change}%
            </span>
          </div>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gray-900 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${topic.score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{topic.students} students</p>
      </div>
    </div>
  );
};

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-sm">
      <p style={{ color: payload[0].payload.fill }} className="font-semibold">
        {payload[0].name}: {payload[0].value}%
      </p>
    </div>
  );
};

const TopicPerformance = ({ selectedClass = "all", period = "Month" }) => {
  const topics   = TOPICS_DATA[selectedClass]?.[period] ?? TOPICS_DATA.all.Month;
  const donut    = DONUT_DATA[selectedClass] ?? DONUT_DATA.all;
  const donutArr = Object.entries(donut).map(([name, value]) => ({ name, value }));


  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
      {/* Topic Performance */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible"
        className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6">Topic Performance</h3>
        <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible" key={`${selectedClass}-${period}`}>
          {topics.map((topic) => (
            <motion.div key={topic.name} variants={cardVariants}>
              <TopicRow topic={topic} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible"
        className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-6">
        <h3 className="text-xl font-bold mb-6">Question Difficulty Distribution</h3>

        <div style={{ width: "100%", height: 256 }}>
          {ready && (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie data={donutArr} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>
                  {donutArr.map((entry) => (
                    <Cell key={entry.name} fill={DONUT_COLORS[entry.name]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {donutArr.map((entry) => (
            <div key={entry.name} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[entry.name] }} />
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
              <p className="text-lg font-bold">{entry.value}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TopicPerformance;