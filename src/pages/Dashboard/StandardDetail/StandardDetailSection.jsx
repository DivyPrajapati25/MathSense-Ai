import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  Loader, AlertCircle, TrendingUp, AlertTriangle,
  Rocket, BookOpen, Minus, Plus,
} from "lucide-react";
import { getStandardDetail } from "../../../services/teacherService";

const TREND_OPTIONS = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const StatCard = ({ icon: Icon, label, value, suffix, color, iconBg }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? 0}{suffix ?? ""}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const CustomTrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-0.5">{d?.assignment_name}</p>
      <p className="text-xs text-gray-500 mb-1">{d?.created_at}</p>
      <p className="text-blue-600 font-bold">Avg Score: {d?.avg_score}%</p>
    </div>
  );
};

const StandardDetailSection = ({ standardId, standardName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trendType, setTrendType] = useState("week");
  const [trendValue, setTrendValue] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStandardDetail(standardId, { trendType, value: trendValue });
      setData(res.data?.data ?? null);
    } catch {
      setError("Failed to load class data.");
    } finally {
      setLoading(false);
    }
  }, [standardId, trendType, trendValue]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const std = data.standard ?? {};
  const topicData = std.topic_performance ?? [];
  const trendData = data.trend ?? [];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">{standardName} — Performance Overview</h3>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Avg. Class Performance"
          value={std.average_class_performance}
          suffix="%"
          color="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon={AlertTriangle}
          label="Likely to Struggle"
          value={std.likely_to_struggle_students}
          color="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          icon={Rocket}
          label="Ready to Advance"
          value={std.ready_to_advance_students}
          color="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      {/* Topic performance chart */}
      {topicData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" /> Topic Performance
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topicData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem" }}
              />
              <Bar dataKey="avg_score" fill="url(#topicGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="topicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Performance Trend
          </h4>
          <div className="flex items-center gap-3">
            {/* Period type buttons */}
            <div className="flex items-center gap-1.5">
              {TREND_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setTrendType(o.value); setTrendValue(1); }}
                  className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
                    trendType === o.value
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Value stepper */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-gray-50 h-7 px-1">
              <button
                onClick={() => setTrendValue((v) => Math.max(1, v - 1))}
                disabled={trendValue <= 1}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-semibold text-gray-700 min-w-[40px] text-center">
                Last {trendValue}
              </span>
              <button
                onClick={() => setTrendValue((v) => v + 1)}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No trend data available yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="assignment_name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTrendTooltip />} />
              <Line type="monotone" dataKey="avg_score" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StandardDetailSection;
