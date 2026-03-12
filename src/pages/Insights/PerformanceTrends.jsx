import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cardVariants } from "../../utils/animations";

const DATA = {
  all: {
    Week: [
      { label: "Mon", Performance: 78, AIAccuracy: 74 },
      { label: "Tue", Performance: 80, AIAccuracy: 76 },
      { label: "Wed", Performance: 83, AIAccuracy: 79 },
      { label: "Thu", Performance: 85, AIAccuracy: 82 },
      { label: "Fri", Performance: 82, AIAccuracy: 80 },
      { label: "Sat", Performance: 81, AIAccuracy: 78 },
      { label: "Sun", Performance: 83, AIAccuracy: 81 },
    ],
    Month: [
      { label: "Week 1", Performance: 72, AIAccuracy: 68 },
      { label: "Week 2", Performance: 78, AIAccuracy: 74 },
      { label: "Week 3", Performance: 75, AIAccuracy: 80 },
      { label: "Week 4", Performance: 84, AIAccuracy: 88 },
    ],
  },
  class1: {
    Week: [
      { label: "Mon", Performance: 76, AIAccuracy: 72 },
      { label: "Tue", Performance: 79, AIAccuracy: 75 },
      { label: "Wed", Performance: 82, AIAccuracy: 78 },
      { label: "Thu", Performance: 84, AIAccuracy: 80 },
      { label: "Fri", Performance: 83, AIAccuracy: 79 },
      { label: "Sat", Performance: 82, AIAccuracy: 77 },
      { label: "Sun", Performance: 82, AIAccuracy: 80 },
    ],
    Month: [
      { label: "Week 1", Performance: 70, AIAccuracy: 65 },
      { label: "Week 2", Performance: 75, AIAccuracy: 70 },
      { label: "Week 3", Performance: 78, AIAccuracy: 75 },
      { label: "Week 4", Performance: 82, AIAccuracy: 84 },
    ],
  },
  class2: {
    Week: [
      { label: "Mon", Performance: 82, AIAccuracy: 78 },
      { label: "Tue", Performance: 85, AIAccuracy: 81 },
      { label: "Wed", Performance: 87, AIAccuracy: 84 },
      { label: "Thu", Performance: 88, AIAccuracy: 86 },
      { label: "Fri", Performance: 86, AIAccuracy: 83 },
      { label: "Sat", Performance: 85, AIAccuracy: 82 },
      { label: "Sun", Performance: 87, AIAccuracy: 84 },
    ],
    Month: [
      { label: "Week 1", Performance: 78, AIAccuracy: 74 },
      { label: "Week 2", Performance: 82, AIAccuracy: 79 },
      { label: "Week 3", Performance: 84, AIAccuracy: 83 },
      { label: "Week 4", Performance: 87, AIAccuracy: 90 },
    ],
  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p style={{ color: "#3B82F6" }} className="font-semibold">
        {payload[0]?.name}: {payload[0]?.value}%
      </p>
    </div>
  );
};

const PerformanceTrends = ({ period = "Month", selectedClass = "all" }) => {
  const [activeView, setActiveView] = useState("Performance");
  const [ready, setReady] = useState(false);

  const dataKey = activeView === "Performance" ? "Performance" : "AIAccuracy";
  const rawData = DATA[selectedClass]?.[period] ?? DATA.all.Month;

  const [chartData, setChartData] = useState(
    rawData.map((d) => ({ label: d.label, value: 0 }))
  );

  useEffect(() => {
    const zeroData = rawData.map((d) => ({ label: d.label, value: 0 }));
    setChartData(zeroData);

    const t = setTimeout(() => {
      setChartData(rawData.map((d) => ({ label: d.label, value: d[dataKey] })));
    }, 80);

    return () => clearTimeout(t);
  }, [activeView, period, selectedClass, dataKey, rawData]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border p-6 mb-8 border-gray-200"
    >

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-xl font-bold whitespace-nowrap">Performance Trends</h3>
        <div className="flex items-center space-x-2">
          {["Performance", "AI Accuracy"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-8 rounded-md px-3 transition-all ${activeView === v
                ? "bg-black text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        {ready && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />

              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                name={activeView}
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#blueGrad)"
                dot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-sm text-gray-600 font-medium">{activeView}</span>
      </div>
    </motion.div>
  );
};

export default PerformanceTrends;