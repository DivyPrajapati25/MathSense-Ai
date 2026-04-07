import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Loader, CalendarClock } from "lucide-react";
import { cardVariants } from "../../utils/animations";

/* ─── Chart helpers ─── */
const formatChartDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatChartDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl p-3.5 text-sm min-w-[180px]">
      {/* Full assignment name in tooltip */}
      <p className="font-semibold text-[var(--color-text-primary)] mb-1 truncate max-w-[200px]">
        {data?.name}
      </p>
      {data?.dateFormatted && (
        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs mb-2">
          <CalendarClock className="w-3 h-3" />
          <span>{data.dateFormatted}</span>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1.5 border-t border-[var(--color-border)]">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        <span className="text-blue-600 dark:text-blue-400 font-bold text-base">
          {payload[0]?.value}%
        </span>
        <span className="text-[var(--color-text-muted)] text-xs">Avg Score</span>
      </div>
    </div>
  );
};

/* ─── Custom X-Axis Tick — horizontal, truncated ─── */
const CustomXAxisTick = ({ x, y, payload }) => {
  const maxLen = 10;
  const label = payload.value?.length > maxLen
    ? payload.value.slice(0, maxLen - 1) + "…"
    : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        fontSize={11}
      >
        {label}
      </text>
    </g>
  );
};

const PerformanceTrends = ({ trendData = [], isLoading }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const chartData = trendData.map((t) => ({
    name: t.assignment_name,           // full name → shown in tooltip
    label: t.assignment_name.length > 10  // short label → shown on X-axis
      ? t.assignment_name.slice(0, 9) + "…"
      : t.assignment_name,
    date: formatChartDate(t.created_at),
    dateFormatted: formatChartDateTime(t.created_at),
    value: t.avg_score ?? 0,
  }));

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
          Performance Trends
        </h3>
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
        <div style={{ width: "100%", height: 340 }}>
          {ready && (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
              >
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />

                {/* FIX: use "label" (short truncated) as dataKey,
                    render via CustomXAxisTick so text stays horizontal */}
                <XAxis
                  dataKey="label"
                  tick={<CustomXAxisTick />}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={50}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#3B82F6", strokeWidth: 1, strokeDasharray: "4 4" }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Avg Score"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#blueGrad)"
                  dot={{ r: 4, fill: "#3B82F6", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#3B82F6", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-sm text-[var(--color-text-secondary)] font-medium">
          Average Score per Assignment
        </span>
      </div>
    </motion.div>
  );
};

export default PerformanceTrends;