const STATUS_STYLES = {
  COMPLETED:  "border-green-200 bg-green-100 text-green-800",
  PENDING:    "border-yellow-200 bg-yellow-100 text-yellow-800",
  PROCESSING: "border-blue-200 bg-blue-100 text-blue-800",
  FAILED:     "border-red-200 bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  COMPLETED: "Created",
  PENDING: "Pending",
  PROCESSING: "Processing",
  FAILED: "Failed",
};

const StatusBadge = ({ status, className = "" }) => (
  <span
    className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
      STATUS_STYLES[status] ?? "border-gray-200 bg-gray-100 text-gray-800"
    } ${className}`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;