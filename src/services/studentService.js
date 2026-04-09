import api from "./api";

export const getStudentDashboard = (params = {}) => {
  const query = {};
  if (params.trendType) query.trend_type = params.trendType;
  if (params.value) query.value = params.value;
  return api.get("/student/dashboard", { params: query });
};


export const uploadStudentAssignment = (file, teacherAssignmentId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("teacher_assignment_id", teacherAssignmentId);
  return api.post("/student/upload-assignment/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getUploadStatus = (assignmentId) =>
  api.get(`/student/upload-assignment/status/${assignmentId}`);

export const getAssignmentsList = (params = {}) => {
  const query = {};
  if (params.filter) query.filter = params.filter;
  if (params.page) query.page = params.page;
  if (params.pageSize) query.page_size = params.pageSize;
  return api.get("/student/assignments_list", { params: query });
};

export const getStudentAssignment = (assignmentId) =>
  api.get(`/student/assignment/${assignmentId}`);
