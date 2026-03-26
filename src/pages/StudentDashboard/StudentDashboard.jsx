import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Rocket, BookOpen, Trophy, Target, TrendingUp,
    Upload, Clock, CheckCircle, XCircle, Loader,
    AlertCircle, FileText, ChevronRight, X, AlertTriangle
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const PERIODS = ["week", "month", "year", "semester"];

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
};

// ✅ Stat Card
const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",    text: "text-blue-700"   },
        green:  { bg: "bg-green-50",  icon: "bg-green-100 text-green-600",   text: "text-green-700"  },
        purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-700" },
        orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", text: "text-orange-700" },
        red:    { bg: "bg-red-50",    icon: "bg-red-100 text-red-600",       text: "text-red-700"    },
    };
    const c = colors[color] ?? colors.blue;
    return (
        <div className={`${c.bg} rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
            </div>
        </div>
    );
};

// ✅ Trend Chart
const TrendChart = ({ trendData }) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 50);
        return () => clearTimeout(t);
    }, []);

    const chartData = trendData.map((t) => ({
        label: t.assignment_name,
        value: t.score ?? 0,
    }));

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No trend data available yet.
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: 220 }}>
            {ready && (
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                                        <p className="font-medium text-gray-700 mb-1">{label}</p>
                                        <p className="text-blue-600 font-semibold">Score: {payload[0]?.value}%</p>
                                    </div>
                                );
                            }}
                        />
                        <Area
                            type="monotone" dataKey="value" name="Score"
                            stroke="#3B82F6" strokeWidth={3} fill="url(#studentGrad)"
                            dot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                            isAnimationActive animationDuration={1200} animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

// ✅ Upload Modal
const UploadAssignmentModal = ({ onClose, onSuccess }) => {
    const [teacherAssignmentId, setTeacherAssignmentId] = useState("");
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    const handleSubmit = async () => {
        if (!file || !teacherAssignmentId.trim()) return;
        setError("");
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("data", JSON.stringify({
                teacher_assignment_id: teacherAssignmentId.trim(),
            }));
            const res = await api.post("/student/upload-assignment/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const taskId = res.data?.data?.task_id;
            onSuccess(taskId);
            onClose();
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.detail;
            setError(!err.response ? "Network error. Please check your connection."
                : typeof message === "string" ? message : "Upload failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Upload Assignment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {error && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span>
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Assignment ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter teacher assignment ID..."
                            value={teacherAssignmentId}
                            onChange={(e) => setTeacherAssignmentId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-1">Ask your teacher for the assignment ID</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Upload Your Answer PDF <span className="text-red-500">*</span>
                        </label>
                        <button type="button" onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-200 rounded-xl min-h-[80px] flex flex-col items-center justify-center gap-2 text-sm hover:bg-blue-50 hover:border-blue-400 transition-colors">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-700">{file ? file.name : "Click to browse PDF"}</span>
                        </button>
                        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button onClick={onClose} disabled={isSubmitting}
                        className="h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit}
                        disabled={!file || !teacherAssignmentId.trim() || isSubmitting}
                        className="h-9 px-4 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2">
                        {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Submit</>}
                    </button>
                </div>
            </div>
        </>
    );
};

// ✅ Task status banner
const TaskStatusBanner = ({ taskId, onDismiss }) => {
    const [status, setStatus] = useState("PENDING");

    useEffect(() => {
        if (!taskId) return;
        const poll = setInterval(async () => {
            try {
                const res = await api.get(`/student/upload-assignment/status/${taskId}`);
                const s = res.data?.data?.status;
                setStatus(s);
                if (s === "SUCCESS" || s === "FAILURE") clearInterval(poll);
            } catch { clearInterval(poll); }
        }, 3000);
        return () => clearInterval(poll);
    }, [taskId]);

    const config = {
        PENDING: { color: "bg-yellow-50 border-yellow-200 text-yellow-700", icon: Loader,      spin: true,  text: "Assignment uploaded! AI is processing..."  },
        STARTED: { color: "bg-blue-50 border-blue-200 text-blue-700",       icon: Loader,      spin: true,  text: "AI is evaluating your assignment..."        },
        RETRY:   { color: "bg-orange-50 border-orange-200 text-orange-700", icon: Loader,      spin: true,  text: "Retrying processing..."                    },
        SUCCESS: { color: "bg-green-50 border-green-200 text-green-700",    icon: CheckCircle, spin: false, text: "Assignment evaluated successfully! 🎉"      },
        FAILURE: { color: "bg-red-50 border-red-200 text-red-700",          icon: XCircle,     spin: false, text: "Processing failed. Please try again."       },
    };
    const c = config[status] ?? config.PENDING;
    const Icon = c.icon;

    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${c.color}`}>
            <Icon className={`w-5 h-5 shrink-0 ${c.spin ? "animate-spin" : ""}`} />
            <span className="flex-1">{c.text}</span>
            {(status === "SUCCESS" || status === "FAILURE") && (
                <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
};

// ✅ Assignment Card
const AssignmentCard = ({ assignment }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/student/assignment/${assignment.assignment_id}`)}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
        >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{assignment.assignment_name}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Submitted: {formatDate(assignment.submitted_on)}
                </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </motion.div>
    );
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const [period, setPeriod] = useState("week"); // ✅ period filter
    const [dashboardData, setDashboardData] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [activeTaskId, setActiveTaskId] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                const [dashRes, assRes] = await Promise.all([
                    // ✅ pass period as trend_type
                    api.get("/student/dashboard", { params: { trend_type: period, value: 1 } }),
                    api.get("/student/assignments_list"),
                ]);
                setDashboardData(dashRes.data?.data ?? null);
                setAssignments(assRes.data?.data?.assignments ?? []);
            } catch {
                setError("Failed to load dashboard. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [period]); // ✅ re-fetch when period changes

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
                </div>
            </div>
        );
    }

    const dashboard = dashboardData?.dashboard;
    const trendData = dashboardData?.trend ?? [];
    const improvementAreas = dashboard?.improvement_areas ?? [];

    const stats = [
        { icon: BookOpen,   label: "Total Assignments",    value: dashboard?.total_assignments ?? 0,   color: "blue"   },
        { icon: CheckCircle, label: "Attended",            value: dashboard?.assignments_attended ?? 0, color: "green"  },
        { icon: Trophy,     label: "Average Score",        value: `${dashboard?.average_score ?? 0}%`, color: "purple" },
        { icon: Target,     label: "Best Score",           value: `${dashboard?.best_score ?? 0}%`,    color: "orange" },
        { icon: AlertTriangle, label: "Mistake Rate",      value: `${dashboard?.mistake_rate ?? 0}%`,  color: "red"    },
        { icon: XCircle,    label: "Skipped",              value: dashboard?.skipped_assignments ?? 0,  color: "orange" },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Welcome, {user?.first_name || "Student"}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Here's your performance overview</p>
                </div>
                <button onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all shadow-md w-full sm:w-auto">
                    <Upload className="w-4 h-4" /> Upload Assignment
                </button>
            </motion.div>

            {/* ✅ Period filter */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-sm text-gray-500 mr-1">Period:</span>
                {PERIODS.map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                        className={`h-8 px-3 rounded-md text-sm font-medium capitalize transition-all ${
                            period === p
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}>
                        {p}
                    </button>
                ))}
            </div>

            {/* Task status banner */}
            {activeTaskId && (
                <div className="mb-6">
                    <TaskStatusBanner taskId={activeTaskId} onDismiss={() => setActiveTaskId(null)} />
                </div>
            )}

            {/* Stats */}
            {isLoading ? (
                <div className="flex items-center justify-center h-32">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {stats.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                <StatCard {...s} />
                            </motion.div>
                        ))}
                    </div>

                    {/* ✅ Performance Trend Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Performance Trend
                        </h2>
                        <TrendChart trendData={trendData} />
                    </motion.div>

                    {/* ✅ Improvement Areas */}
                    {improvementAreas.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-orange-50 rounded-2xl border border-orange-200 p-6 mb-6">
                            <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" /> Areas to Improve
                            </h2>
                            <div className="space-y-3">
                                {improvementAreas.map((area) => (
                                    <div key={area.topic}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-800">{area.topic}</span>
                                            <span className="text-orange-700 font-bold">{area.mistake_rate}% mistakes</span>
                                        </div>
                                        <div className="w-full bg-orange-100 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${area.mistake_rate}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className="h-2 rounded-full bg-orange-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Assignments List */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">My Assignments</h2>
                        {assignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 rounded-2xl border border-dashed border-gray-200 gap-3">
                                <Rocket className="w-10 h-10 text-gray-300" />
                                <p className="text-gray-400 text-sm">No assignments submitted yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {assignments.map((a) => (
                                    <AssignmentCard key={a.assignment_id} assignment={a} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {uploadOpen && (
                <UploadAssignmentModal
                    onClose={() => setUploadOpen(false)}
                    onSuccess={(taskId) => setActiveTaskId(taskId)}
                />
            )}
        </div>
    );
};

export default StudentDashboard;