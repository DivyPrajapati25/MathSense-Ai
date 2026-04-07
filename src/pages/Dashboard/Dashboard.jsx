import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, CheckCircle, Upload, RefreshCw,
  Filter, RotateCcw, Send, GraduationCap, Plus, X, Loader, Hash,
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

/* ─── Create Class Modal ─── */
const CreateClassModal = ({ existingStandards, onClose, onCreated }) => {
  const toast = useToast();
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);        // staged class numbers
  const [fieldError, setFieldError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const existingNums = existingStandards.map((s) => Number(s.standard));

  // Lock scroll & Escape key
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // ── Tag helpers ──
  const addTag = (raw) => {
    const val = raw.trim();
    if (!val) return;
    const num = parseInt(val, 10);

    if (isNaN(num) || num < 1 || num > 12) {
      setFieldError("Enter a class number between 1 and 12.");
      return;
    }
    if (existingNums.includes(num)) {
      setFieldError(`Class ${num} already exists.`);
      return;
    }
    if (tags.includes(num)) {
      setFieldError(`Class ${num} is already added.`);
      return;
    }
    setTags((prev) => [...prev, num].sort((a, b) => a - b));
    setInputValue("");
    setFieldError("");
  };

  const removeTag = (num) => setTags((prev) => prev.filter((n) => n !== num));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e) => {
    setFieldError("");
    // only allow digits
    setInputValue(e.target.value.replace(/[^\d]/g, ""));
  };

  // ── Submit ──
  const handleCreate = async () => {
    if (!tags.length || isCreating) return;
    setIsCreating(true);
    try {
      await api.post("/student/standards", tags);
      setCreated(true);
      toast.success(
        `Class${tags.length > 1 ? "es" : ""} ${tags.join(", ")} created successfully!`
      );
      onCreated();
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail;
      // Friendly message for duplicate-key 500
      if (
        err.response?.status === 500 &&
        typeof msg === "string" &&
        msg.includes("already exists")
      ) {
        toast.error("One or more classes already exist.");
      } else {
        toast.error(typeof msg === "string" ? msg : "Failed to create class.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative z-10 w-full max-w-md bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-5 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              Create New Class
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5 leading-snug">
              Type a class number and press{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] font-mono text-[var(--color-text-secondary)]">
                Enter
              </kbd>{" "}
              to add it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">

          {/* Tag pill input */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
              Class Number <span className="text-red-500">*</span>
            </label>

            {/* Pill box */}
            <div
              onClick={() => inputRef.current?.focus()}
              className={`min-h-[44px] flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border-2 bg-[var(--color-bg-secondary)] cursor-text transition-colors ${
                fieldError
                  ? "border-red-400 dark:border-red-600"
                  : "border-[var(--color-border)] focus-within:border-blue-500"
              }`}
            >
              <AnimatePresence>
                {tags.map((num) => (
                  <motion.span
                    key={num}
                    initial={{ opacity: 0, scale: 0.65 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.65 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold select-none"
                  >
                    <Hash className="w-3 h-3 opacity-70" />
                    {num}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeTag(num); }}
                      className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Remove class ${num}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>

              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (inputValue) addTag(inputValue); }}
                placeholder={tags.length === 0 ? "e.g. 8, 9, 10 …" : ""}
                className="flex-1 min-w-[90px] text-sm bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
              />

              {/* Inline add button that appears while typing */}
              <AnimatePresence>
                {inputValue && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => addTag(inputValue)}
                    className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Error / hint */}
            <AnimatePresence mode="wait">
              {fieldError ? (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1.5 text-xs text-red-500 dark:text-red-400"
                >
                  {fieldError}
                </motion.p>
              ) : (
                <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                  Press <span className="font-medium">Enter</span>,{" "}
                  <span className="font-medium">Space</span>, or{" "}
                  <span className="font-medium">,</span> after each number · Backspace removes the last
                </p>
              )}
            </AnimatePresence>
          </div>

          {/* Already existing */}
          {existingNums.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <span className="text-xs font-medium text-[var(--color-text-muted)] w-full mb-1">
                Already created:
              </span>
              {existingNums.sort((a, b) => a - b).map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1 h-5 px-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[10px] font-medium text-[var(--color-text-muted)]"
                >
                  <Hash className="w-2.5 h-2.5" />
                  {n}
                </span>
              ))}
            </div>
          )}

          {/* Preview of what will be created */}
          <AnimatePresence>
            {tags.length > 0 && !created && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-0.5">
                    Will create {tags.length} class{tags.length > 1 ? "es" : ""}:
                  </p>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    {tags.map((n) => `Class ${n}`).join(", ")}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {created && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Classes created!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    Closing automatically…
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        {!created && (
          <div className="px-6 pb-6 pt-1 flex gap-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleCreate}
              disabled={!tags.length || isCreating}
              whileTap={{ scale: 0.97 }}
              className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm"
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Create{tags.length > 0 ? ` ${tags.length}` : ""} Class{tags.length > 1 ? "es" : ""}
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
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
  const [createClassOpen, setCreateClassOpen] = useState(false);

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

  const fetchStandards = useCallback(async () => {
    setStandardsLoading(true);
    try {
      const res = await api.get("/student/standards");
      setAllStandards(res.data?.data?.standards ?? []);
    } catch { }
    finally { setStandardsLoading(false); }
  }, []);

  useEffect(() => { fetchStandards(); }, [fetchStandards]);

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
      const total     = allRes.data?.data?.pagination?.total_count ?? 0;
      const reviewed  = reviewedRes.data?.data?.pagination?.total_count ?? 0;
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
  const classesWithAssignments = allStandards.filter((s) => (classCounts[s.id] ?? 0) > 0);

  const scrollToAssignments = () => {
    setTimeout(() => {
      assignmentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleStatClick = (type) => {
    setPage(1); setStatusFilter(""); setSortBy("latest");
    switch (type) {
      case "total":     setIsReviewedFilter(""); setIsPublishedFilter(""); break;
      case "pending":   setIsReviewedFilter("false"); setIsPublishedFilter(""); break;
      case "reviewed":  setIsReviewedFilter("true"); setIsPublishedFilter(""); break;
      case "published": setIsReviewedFilter(""); setIsPublishedFilter("true"); break;
      default: break;
    }
    scrollToAssignments();
  };

  const handleView = (a) => navigate(`/assignment/${a.assignment_id}`);

  const handleReviewConfirm = async () => {
    if (!reviewTarget) return;
    setIsReviewing(true);
    try {
      await markReviewed(reviewTarget.assignment_id);
      toast.success(`"${reviewTarget.pdf_file_name}" marked as reviewed.`);
      setReviewTarget(null); refreshAll();
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
      setDeleteTarget(null); setPage(1); refreshAll();
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

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            onClick={() => setCreateClassOpen(true)}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium text-[var(--color-text-primary)] border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Create Class</span>
            <span className="sm:hidden">Class</span>
          </motion.button>
          <motion.button
            onClick={() => navigate("/upload")}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Assignment</span>
            <span className="sm:hidden">Upload</span>
          </motion.button>
        </div>
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
        {createClassOpen && (
          <CreateClassModal
            existingStandards={allStandards}
            onClose={() => setCreateClassOpen(false)}
            onCreated={() => { fetchStandards(); rebuildClassCounts(); }}
          />
        )}
      </AnimatePresence>

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