import api from "./api";

export const uploadAssignment = (file, data) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("data", JSON.stringify({ data }));
  return api.post("/teacher/assignments/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAssignments = (params = {}) => {
  const query = {};
  if (params.page) query.page = params.page;
  if (params.pageSize) query.page_size = params.pageSize;
  if (params.statusFilter) query.status_filter = params.statusFilter;
  if (params.sortBy) query.sort_by = params.sortBy;
  if (typeof params.isReviewed === "boolean") query.is_reviewed = params.isReviewed;
  if (typeof params.isPublished === "boolean") query.is_published = params.isPublished;
  return api.get("/teacher/assignments/", { params: query });
};

export const getAssignmentDetail = (assignmentId) =>
  api.get(`/teacher/assignments/${assignmentId}`);

export const updateAssignment = (assignmentId, corrections) =>
  api.patch(`/teacher/assignments/${assignmentId}`, corrections);

export const deleteAssignment = (assignmentId) =>
  api.delete(`/teacher/assignments/${assignmentId}`);

export const getReviewStatus = (assignmentId) =>
  api.get(`/teacher/assignments/${assignmentId}/review-status`);

export const markReviewed = (assignmentId) =>
  api.patch(`/teacher/assignments/${assignmentId}/mark-reviewed`);

export const publishAssignment = (assignmentId, deadline) =>
  api.patch(`/teacher/assignments/${assignmentId}/publish`, { deadline });

export const getDashboardSummary = () =>
  api.get("/teacher/dashboard");

export const getStandardDetail = (standardId, params = {}) => {
  const query = {};
  if (params.trendType) query.trend_type = params.trendType;
  if (params.value) query.value = params.value;
  return api.get(`/teacher/dashboard/${standardId}`, { params: query });
};
