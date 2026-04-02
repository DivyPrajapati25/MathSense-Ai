import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Upload, X, ChevronDown, Loader } from "lucide-react";
import { backdropVariants, modalVariants, dropdownVariants } from "../../utils/animations";
import { uploadAssignment } from "../../services/teacherService";
import { useToast } from "../../components/common/Toast/Toast";
import api from "../../services/api";

const CreateAssignmentModal = ({ onClose, onSuccess, prefillName }) => {
  const toast = useToast();
  const [name, setName] = useState(prefillName ?? "");
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [standards, setStandards] = useState([]);
  const [dropOpen, setDropOpen] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const assignmentRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  useEffect(() => {
    api.get("/student/standards").then((res) => {
      setStandards(res.data?.data?.standards ?? []);
    }).catch(() => setStandards([]));
  }, []);

  const canSubmit = name.trim() && assignmentFile && selectedStandard && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await uploadAssignment(assignmentFile, { standard_id: selectedStandard.id, assignment_name: name.trim() });
      toast.success("Assignment created! AI is processing it in the background.");
      onSuccess?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 409) toast.error("An assignment with this name already exists.");
      else if (!err.response) toast.error("Network error.");
      else toast.error(message || "Failed to create assignment.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" variants={backdropVariants}
        initial="hidden" animate="visible" exit="exit" onClick={onClose} />
      <motion.div
        className="fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] shadow-lg w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col p-0"
        variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg leading-none font-semibold text-[var(--color-text-primary)] mb-1">
            {prefillName ? "Re-upload Assignment" : "Create New Assignment"}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {prefillName ? "Upload a new PDF for this assignment." : "Upload a PDF assignment. AI will process it via OCR."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4 py-4 pr-4">
            <div>
              <label htmlFor="newAssignmentName" className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] leading-none mb-1 select-none">
                Assignment Name <span className="text-red-500">*</span>
              </label>
              <input id="newAssignmentName" type="text" placeholder="e.g., Algebra Practice 1"
                value={name} onChange={(e) => setName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors mt-1" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] leading-none mb-1 select-none">
                Class / Standard <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button type="button" onClick={() => setDropOpen((p) => !p)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors">
                  <span className={selectedStandard ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}>
                    {selectedStandard ? `Class ${selectedStandard.standard}` : "Select standard"}
                  </span>
                  <motion.span animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div className="absolute z-50 top-10 left-0 w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md shadow-md overflow-hidden"
                      variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                      {standards.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">No standards found</div>
                      ) : (
                        standards.map((s) => (
                          <button key={s.id} type="button" onClick={() => { setSelectedStandard(s); setDropOpen(false); }}
                            className={`flex w-full px-3 py-2 text-sm text-left hover:bg-[var(--color-bg-secondary)] transition-colors ${selectedStandard?.id === s.id ? "bg-[var(--color-bg-secondary)] font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                            Class {s.standard}
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] leading-none mb-1 select-none">
                Upload Assignment PDF <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={() => assignmentRef.current?.click()}
                className="w-full mt-1 border-dashed border-2 border-[var(--color-border)] rounded-md h-20 flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)] transition-colors">
                <Upload className="w-5 h-5 mr-2 text-[var(--color-text-muted)]" />
                {assignmentFile ? assignmentFile.name : "Click to upload assignment PDF"}
              </button>
              <input ref={assignmentRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => setAssignmentFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0 rounded-b-lg">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={onClose} disabled={isSubmitting}
              className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:pointer-events-none">
              {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : prefillName ? "Re-upload" : "Create Assignment"}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-opacity focus:outline-none" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </>
  );
};

const CreateNewAssignment = ({ onAssignmentCreated, reuploadName, onClearReupload }) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { if (reuploadName) setModalOpen(true); }, [reuploadName]);
  const handleClose = () => { setModalOpen(false); onClearReupload?.(); };

  return (
    <section className="mb-12 md:mb-16">
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Create a New Assignment</h2>
            <p className="text-[var(--color-text-secondary)]">Upload a PDF assignment. AI will run OCR and convert it to structured questions.</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 h-[44px] px-4 py-2 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus className="w-5 h-5 mr-2" /> Create New Assignment
        </button>
      </div>

      <AnimatePresence>
        {modalOpen && <CreateAssignmentModal onClose={handleClose} onSuccess={onAssignmentCreated} prefillName={reuploadName} />}
      </AnimatePresence>
    </section>
  );
};

export default CreateNewAssignment;