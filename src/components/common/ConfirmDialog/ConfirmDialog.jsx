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

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={!isLoading ? onCancel : undefined}
      />
      <motion.div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-6"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {message && <p className="text-sm text-gray-500">{message}</p>}
          </div>
          {!isLoading && (
            <button
              onClick={onCancel}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
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
    </>
  );
};

export default ConfirmDialog;
