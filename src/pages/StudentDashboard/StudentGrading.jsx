import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, Loader,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentsList, getUploadStatus } from "../../services/studentService";
import {
  AttemptedRow, NotAttemptedRow, MissedRow,
  EmptyState, StudentPagination,
} from "./StudentComponents";
import { UploadModal, TaskStatusBanner } from "./StudentModals";

const TABS = [
  { key: "not_attempted", label: "Pending",   icon: Clock },
  { key: "attempted",     label: "Submitted", icon: CheckCircle },
  { key: "missed",        label: "Missed",    icon: XCircle },
];

const StudentGrading = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("not_attempted");
  const [assignmentsData, setAssignmentsData] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set()); // IDs still being processed
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [pages, setPages] = useState({
    not_attempted: 1,
    attempted: 1,
    missed: 1,
  });

  const [uploadTarget, setUploadTarget] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const contentRef = useRef(null);

  const currentPage = pages[activeTab];
  const setCurrentPage = (updater) => {
    setPages((prev) => ({
      ...prev,
      [activeTab]: typeof updater === "function" ? updater(prev[activeTab]) : updater,
    }));
  };

  // Check processing status for each attempted assignment
  const checkProcessingStatuses = useCallback(async (attemptedAssignments) => {
    if (!attemptedAssignments?.length) {
      setProcessingIds(new Set());
      return;
    }
    const stillProcessing = new Set();
    // Check each submitted assignment's status in parallel
    const statusChecks = attemptedAssignments.map(async (a) => {
      try {
        const res = await getUploadStatus(a.student_assignment_id);
        const status = res.data?.data?.status;
        if (status === "PENDING" || status === "PROCESSING") {
          stillProcessing.add(a.student_assignment_id);
        }
      } catch {
        // If status check fails, assume completed (don't block the UI)
      }
    });
    await Promise.all(statusChecks);
    setProcessingIds(stillProcessing);
  }, []);

  // Fetch assignments — called on mount and on page change
  const fetchAssignments = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError("");
    try {
      const res = await getAssignmentsList({ page: currentPage, pageSize: 10 });
      const data = res.data?.data ?? null;

      // ── Client-side deadline safety check ──
      // Move any "missed" assignments whose deadline is still in the future
      // back into the "not_attempted" list (API may miscategorize).
      if (data?.missed?.assignments?.length) {
        const now = new Date();
        const reallyMissed = [];
        const movedToPending = [];
        for (const a of data.missed.assignments) {
          if (a.deadline && new Date(a.deadline) > now) {
            movedToPending.push(a);
          } else {
            reallyMissed.push(a);
          }
        }
        if (movedToPending.length > 0) {
          data.missed.assignments = reallyMissed;
          data.missed.total = (data.missed.total ?? 0) - movedToPending.length;
          if (!data.not_attempted) data.not_attempted = { assignments: [], total: 0 };
          data.not_attempted.assignments = [...(data.not_attempted.assignments ?? []), ...movedToPending];
          data.not_attempted.total = (data.not_attempted.total ?? 0) + movedToPending.length;
        }
      }

      setAssignmentsData(data);
      // Check processing status for attempted assignments
      await checkProcessingStatuses(data?.attempted?.assignments);
    } catch {
      setError("Failed to load assignments. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, checkProcessingStatuses]);

  // Read ?tab= query param on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["not_attempted", "attempted", "missed"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch on mount and when page changes
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Tab switch — client-side only, no re-fetch, no scroll jump
  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    setActiveTab(tabKey);
  };

  // Refresh button — re-fetches without full page loading state
  const handleRefresh = () => {
    fetchAssignments(false);
  };

  // After upload success — refresh and track processing
  const handleUploadSuccess = (id) => {
    setActiveTaskId(id);
    // Add to processing set immediately for instant UI feedback
    setProcessingIds((prev) => new Set(prev).add(id));
    fetchAssignments(false);
  };

  const currentTabData = assignmentsData?.[activeTab];
  const currentAssignments = currentTabData?.assignments ?? [];
  const currentPagination = currentTabData
    ? {
        total: currentTabData.total,
        total_pages: currentTabData.total_pages,
        has_next: currentTabData.has_next,
        has_previous: currentTabData.has_previous,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          My Assignments
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          View and manage all your assignments
        </p>
      </motion.div>

      <AnimatePresence>
        {activeTaskId && (
          <TaskStatusBanner
            assignmentId={activeTaskId}
            onDismiss={() => setActiveTaskId(null)}
            onCompleted={() => {
              setActiveTaskId(null);
              fetchAssignments(false);
            }}
          />
        )}
      </AnimatePresence>

      {error && !isLoading ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
          <button onClick={() => fetchAssignments()} className="ml-auto text-xs font-medium underline">Retry</button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6"
        >
          {/* Tab Bar + Refresh */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex border-b border-[var(--color-border)] flex-1 overflow-x-auto">
              {TABS.map((tab) => {
                const count = assignmentsData?.[tab.key]?.total ?? 0;
                const isActive = activeTab === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                        : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh assignments"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Content */}
          {isRefreshing ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : currentAssignments.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="space-y-2">
              {activeTab === "attempted" && currentAssignments.map((a, i) => (
                <AttemptedRow
                  key={a.student_assignment_id}
                  assignment={a}
                  index={i}
                  isProcessing={processingIds.has(a.student_assignment_id)}
                />
              ))}
              {activeTab === "not_attempted" && currentAssignments.map((a, i) => (
                <NotAttemptedRow key={a.teacher_assignment_id} assignment={a} index={i} onUpload={setUploadTarget} />
              ))}
              {activeTab === "missed" && currentAssignments.map((a, i) => (
                <MissedRow key={a.teacher_assignment_id} assignment={a} index={i} />
              ))}
            </div>
          )}

          <StudentPagination
            pagination={currentPagination}
            page={currentPage}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {uploadTarget && (
          <UploadModal
            assignment={uploadTarget}
            onClose={() => setUploadTarget(null)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentGrading;
