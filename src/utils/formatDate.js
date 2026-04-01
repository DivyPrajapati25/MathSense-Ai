/**
 * Format an ISO date string to a readable format.
 * @param {string} isoString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (isoString, options) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
};

/**
 * Format an ISO date string to include time.
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const timeAgo = (isoString) => {
  if (!isoString) return "-";
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};
