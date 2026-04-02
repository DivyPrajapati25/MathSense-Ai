import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader } from "lucide-react";
import { cardVariants } from "../../utils/animations";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-[var(--color-text-primary)] mb-1">{label}</p>
      <p className="text-blue-600 dark:text-blue-400 font-semibold">Avg Score: {payload[0]?.value}%</p>
    </div>
  );
};

const PerformanceTrends = ({ trendData = [], isLoading }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 50); return () => clearTimeout(t); }, []);

  const chartData = trendData.map((t) => ({ label: t.assignment_name, value: t.avg_score ?? 0 }));

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible"
      className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Performance Trends</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[320px]">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[320px] text-[var(--color-text-muted)] text-sm">
          No trend data available yet.
        </div>
      ) : (
        <div style={{ width: "100%", height: 320 }}>
          {ready && (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Avg Score" stroke="#3B82F6" strokeWidth={3} fill="url(#blueGrad)"
                  dot={{ r: 4, fill: "#3B82F6", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#3B82F6", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                  isAnimationActive animationDuration={1200} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-sm text-[var(--color-text-secondary)] font-medium">Average Score per Assignment</span>
      </div>
    </motion.div>
  );
};

export default PerformanceTrends;