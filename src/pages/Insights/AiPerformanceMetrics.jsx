import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { cardVariants, staggerContainer } from "../../utils/animations";

const METRICS = [
  { id: "accuracy",   label: "Accuracy",   value: 100, target: 95, color: "#3B82F6" },
  { id: "speed",      label: "Speed",      value: 91,  target: 90, color: "#10B981" },
  { id: "confidence", label: "Confidence", value: 93,  target: 92, color: "#8B5CF6" },
];

const GaugeCard = ({ metric }) => {
  const data = [{ name: metric.label, value: metric.value, fill: metric.color }];

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-lg p-4 flex flex-col items-center"
    >
      <h3 className="font-bold mb-4 text-center">{metric.label}</h3>

      <div className="relative w-full" style={{ height: 128 }}>
        {ready && (
          <ResponsiveContainer width="100%" height={128}>
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="58%" outerRadius="80%"
              startAngle={0} endAngle={360}
              barSize={10} data={data}
            >
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#e5e7eb" }} data={data} />
            </RadialBarChart>
          </ResponsiveContainer>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: metric.color }}>
            {metric.value}%
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-2 text-center">Target: {metric.target}%</p>
    </motion.div>
  );
};

const AIPerformanceMetrics = () => (
  <section className="mb-12">
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-blue-200 p-6 bg-linear-to-r from-blue-50 to-purple-50"
    >
      <h2 className="text-2xl font-bold mb-6">AI Performance Metrics</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {METRICS.map((metric) => (
          <GaugeCard key={metric.id} metric={metric} />
        ))}
      </motion.div>
    </motion.div>
  </section>
);

export default AIPerformanceMetrics;