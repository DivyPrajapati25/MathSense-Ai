import api from "./api";

export const getUserProfile = () =>
  api.get("/user/");

export const updateUserProfile = (data) =>
  api.patch("/user/", data);

export const getProfileImage = () =>
  api.get("/user/profile-image", { params: { t: new Date().getTime() } });

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

export const getProfileImageUrl = (relativePath) => {
  if (!relativePath || relativePath === "None") return null;

  let cleanPath = relativePath;
  if (cleanPath.startsWith("None/")) {
    cleanPath = cleanPath.substring(5);
  }

  const base = import.meta.env.VITE_BASE_URL?.replace(/\/+$/, "") || "";
  try {
    const url = new URL(base);
    return `${url.origin}/${cleanPath}`;
  } catch {
    return `/${cleanPath}`;
  }
};
