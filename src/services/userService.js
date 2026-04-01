import api from "./api";

// ─── User Profile ───

export const getUserProfile = () =>
  api.get("/user/");

export const updateUserProfile = (data) =>
  api.patch("/user/", data);

// ─── Profile Image ───

export const getProfileImage = () =>
  api.get("/user/profile-image");

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/user/upload-profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProfileImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.patch("/user/update-profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProfileImage = () =>
  api.delete("/user/delete-profile-image");

/**
 * Build full image URL from the relative path returned by the API.
 * Returns null if no path is provided.
 */
export const getProfileImageUrl = (relativePath) => {
  if (!relativePath) return null;
  const base = import.meta.env.VITE_BASE_URL?.replace(/\/+$/, "") || "";
  // The base URL already includes /api or similar path prefix,
  // but profile images are served from the root domain.
  // Extract origin from the base URL.
  try {
    const url = new URL(base);
    return `${url.origin}/${relativePath}`;
  } catch {
    // If VITE_BASE_URL is a relative path, fall back
    return `/${relativePath}`;
  }
};
