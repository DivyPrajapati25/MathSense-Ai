import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, CheckCircle, Upload, RefreshCw,
  Filter, RotateCcw, Send, GraduationCap,
} from "lucide-react";
import { sectionVariants, staggerContainer } from "../../utils/animations";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../components/common/Toast/Toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  getAssignments, deleteAssignment, markReviewed,
} from "../../services/teacherService";

import { StatCard, ClassCard, ClassSkeleton, AssignmentRow, Pagination, LoadingSkeleton } from "./DashboardComponents";
import { ReviewConfirmDialog, PublishModal, EditAssignmentModal } from "./DashboardModals";

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Created",    value: "COMPLETED" },
  { label: "Pending",    value: "PENDING" },
  { label: "Failed",     value: "FAILED" },
];
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/* ═══ Main Dashboard ═══ */
const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const assignmentSectionRef = useRef(null);

  const [allStandards, setAllStandards] = useState([]);
  const [standardsLoading, setStandardsLoading] = useState(true);
  const [classCounts, setClassCounts] = useState({});
  const [selectedStandardId, setSelectedStandardId] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [isReviewedFilter, setIsReviewedFilter] = useState("");
  const [isPublishedFilter, setIsPublishedFilter] = useState("");
  const [statCounts, setStatCounts] = useState({ total: 0, reviewed: 0, pending: 0, published: 0 });

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [reviewTarget, setReviewTarget]   = useState(null);
  const [isReviewing, setIsReviewing]     = useState(false);

  useEffect(() => {
    api.get("/student/standards")
      .then((res) => setAllStandards(res.data?.data?.standards ?? []))
      .catch(() => {})
      .finally(() => setStandardsLoading(false));
  }, []);

  const rebuildClassCounts = useCallback(async () => {
    try {
      const res = await getAssignments({ page: 1, pageSize: 200 });
      const list = res.data?.data?.assignments ?? [];
      const counts = {};
      list.forEach((a) => { counts[a.standard_id] = (counts[a.standard_id] ?? 0) + 1; });
      setClassCounts(counts);
    } catch { }
  }, []);

  useEffect(() => { rebuildClassCounts(); }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, reviewedRes, publishedRes] = await Promise.all([
        getAssignments({ page: 1, pageSize: 1 }),
        getAssignments({ page: 1, pageSize: 1, isReviewed: true }),
        getAssignments({ page: 1, pageSize: 1, isPublished: true }),
      ]);
      const total = allRes.data?.data?.pagination?.total_count ?? 0;
      const reviewed = reviewedRes.data?.data?.pagination?.total_count ?? 0;
      const published = publishedRes.data?.data?.pagination?.total_count ?? 0;
      setStatCounts({ total, reviewed, pending: Math.max(0, total - reviewed), published });
    } catch { }
  }, []);

  const fetchAssignments = useCallback(async (pg = page) => {
    setLoading(true); setError("");
    try {
      const params = { page: pg, pageSize: PAGE_SIZE, sortBy };
      if (statusFilter) params.statusFilter = statusFilter;
      if (isReviewedFilter !== "") params.isReviewed = isReviewedFilter === "true";
      if (isPublishedFilter !== "") params.isPublished = isPublishedFilter === "true";
      const res = await getAssignments(params);
      let list = res.data?.data?.assignments ?? [];
      if (selectedStandardId) list = list.filter((a) => a.standard_id === selectedStandardId);
      setAssignments(list);
      setPagination(res.data?.data?.pagination ?? null);
    } catch {
      setError("Failed to load assignments.");
    } finally { setLoading(false); }
  }, [page, statusFilter, sortBy, isReviewedFilter, isPublishedFilter, selectedStandardId]);

  useEffect(() => { setPage(1); fetchAssignments(1); fetchStats(); }, [statusFilter, sortBy, isReviewedFilter, isPublishedFilter, selectedStandardId]);
  useEffect(() => { fetchAssignments(page); }, [page]);

  const refreshAll = useCallback(() => {
    fetchAssignments(page);
    fetchStats();
    rebuildClassCounts();
  }, [fetchAssignments, fetchStats, rebuildClassCounts, page]);

  const totalPages  = pagination?.total_pages ?? 1;
  const totalCount  = pagination?.total_count ?? 0;
  const activeClass = allStandards.find((s) => s.id === selectedStandardId);
  const hasFilters  = statusFilter || isReviewedFilter || isPublishedFilter || sortBy !== "latest";

  /* ── Stat Card click → scroll & filter ── */
  const scrollToAssignments = () => {
    setTimeout(() => {
      assignmentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleStatClick = (type) => {
    setPage(1);
    setStatusFilter("");
    setSortBy("latest");
    switch (type) {
      case "total":
        setIsReviewedFilter("");
        setIsPublishedFilter("");
        break;
      case "pending":
        setIsReviewedFilter("false");
        setIsPublishedFilter("");
        break;
      case "reviewed":
        setIsReviewedFilter("true");
        setIsPublishedFilter("");
        break;
      case "published":
        setIsReviewedFilter("");
        setIsPublishedFilter("true");
        break;
      default: break;
    }
    scrollToAssignments();
  };
  const classesWithAssignments = allStandards.filter((s) => (classCounts[s.id] ?? 0) > 0);

  const handleView = (a) => navigate(`/assignment/${a.assignment_id}`);

  const handleReviewConfirm = async () => {
    if (!reviewTarget) return;
    setIsReviewing(true);
    try {
      await markReviewed(reviewTarget.assignment_id);
      toast.success(`"${reviewTarget.pdf_file_name}" marked as reviewed.`);
      setReviewTarget(null);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark reviewed.");
    } finally { setIsReviewing(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(deleteTarget.assignment_id);
      toast.success(`"${deleteTarget.pdf_file_name}" deleted.`);
      setDeleteTarget(null);
      setPage(1); refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally { setIsDeleting(false); }
  };

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      variants={staggerContainer} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={sectionVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            {getGreeting()}, {user?.first_name || "Teacher"} 👋
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Here's your assignments overview</p>
        </div>
        <button onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all shrink-0">
          <Upload className="w-4 h-4" /> Upload Assignment
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}    label="Total Assignments" value={statCounts.total}     color="blue"   onClick={() => handleStatClick("total")}    />
        <StatCard icon={Clock}       label="Pending Review"    value={statCounts.pending}   color="amber"  onClick={() => handleStatClick("pending")}  />
        <StatCard icon={CheckCircle} label="Reviewed"          value={statCounts.reviewed}  color="green"  onClick={() => handleStatClick("reviewed")} />
        <StatCard icon={Send}        label="Published"         value={statCounts.published} color="indigo" onClick={() => handleStatClick("published")}/>
      </motion.div>

      {/* Filter by Class */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Filter by Class</h2>
        {standardsLoading ? (
          <ClassSkeleton />
        ) : classesWithAssignments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No classes with assignments yet. Upload an assignment to see classes here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <button
              onClick={() => setSelectedStandardId("")}
              className={`text-left rounded-xl border p-4 transition-all hover:shadow-sm ${
                selectedStandardId === ""
                  ? "border-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] ring-2 ring-[var(--color-border)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-muted)]"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${selectedStandardId === "" ? "bg-[var(--color-bg-tertiary)]" : "bg-[var(--color-bg-secondary)]"}`}>
                <BookOpen className={`w-4 h-4 ${selectedStandardId === "" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`} />
              </div>
              <p className={`text-sm font-bold mb-1 ${selectedStandardId === "" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>All Classes</p>
              <p className="text-xs text-[var(--color-text-muted)]">{statCounts.total} assignments</p>
            </button>
            {classesWithAssignments.map((s) => (
              <ClassCard key={s.id} standard={s}
                isSelected={selectedStandardId === s.id}
                assignmentCount={classCounts[s.id] ?? 0}
                onClick={() => setSelectedStandardId(selectedStandardId === s.id ? "" : s.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assignment List */}
      <div ref={assignmentSectionRef} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm scroll-mt-6">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {activeClass ? `Class ${activeClass.standard} Assignments` : "Your Assignments"}
            </h2>
            {activeClass && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {classCounts[activeClass.id] ?? 0} assignment{(classCounts[activeClass.id] ?? 0) !== 1 ? "s" : ""} ·{" "}
                <button onClick={() => setSelectedStandardId("")} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  View all
                </button>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)] hidden sm:block" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={isReviewedFilter} onChange={(e) => setIsReviewedFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Reviewed: All</option>
              <option value="true">Reviewed</option>
              <option value="false">Unreviewed</option>
            </select>
            <select value={isPublishedFilter} onChange={(e) => setIsPublishedFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Published: All</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <button onClick={refreshAll} title="Refresh"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-secondary)] transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {hasFilters && (
                <button onClick={() => { setStatusFilter(""); setIsReviewedFilter(""); setIsPublishedFilter(""); setSortBy("latest"); }}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          {loading ? <LoadingSkeleton />
          : error ? (
            <div className="flex items-center justify-center gap-3 h-32 rounded-xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 rounded-xl border border-dashed border-[var(--color-border)]">
              <BookOpen className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
              <p className="text-[var(--color-text-muted)] text-sm">
                {activeClass ? `No assignments for Class ${activeClass.standard}` : "No assignments yet"}
              </p>
              <button onClick={() => navigate("/upload")}
                className="mt-3 inline-flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload your first assignment
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <AssignmentRow key={a.assignment_id} assignment={a} allStandards={allStandards}
                  onView={handleView} onEdit={setEditTarget}
                  onReview={setReviewTarget} onPublish={setPublishTarget} onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {reviewTarget && (
          <ReviewConfirmDialog
            assignmentName={reviewTarget.pdf_file_name}
            isLoading={isReviewing}
            onConfirm={handleReviewConfirm}
            onCancel={() => setReviewTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete Assignment"
            message={`Are you sure you want to delete "${deleteTarget.pdf_file_name}"? This action cannot be undone.`}
            confirmLabel="Delete" confirmStyle="danger"
            isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {editTarget && (
        <EditAssignmentModal
          assignmentId={editTarget.assignment_id}
          onClose={() => setEditTarget(null)}
          onSaved={refreshAll}
        />
      )}

      {publishTarget && (
        <PublishModal
          assignmentId={publishTarget.assignment_id}
          assignmentName={publishTarget.pdf_file_name}
          onClose={() => setPublishTarget(null)}
          onPublished={refreshAll}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;