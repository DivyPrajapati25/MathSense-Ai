import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader, X } from "lucide-react";
import { backdropVariants, modalVariants } from "../../../utils/animations";

/**
 * Reusable confirmation dialog with optional loading state.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} props.confirmLabel - e.g. "Delete"
 * @param {string} props.confirmStyle - "danger" | "primary" (default "danger")
 * @param {boolean} props.isLoading
 * @param {function} props.onConfirm
 * @param {function} props.onCancel
 */
const ConfirmDialog = ({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  confirmStyle = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const btnStyles =
    confirmStyle === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={!isLoading ? onCancel : undefined}
      />
      <motion.div
        className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
            {message && <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>}
          </div>
          {!isLoading && (
            <button
              onClick={onCancel}
              className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] opacity-70 hover:opacity-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-9 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2 ${btnStyles}`}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </motion.div>
    </>,
    document.body
  );
};

export default ConfirmDialog;
