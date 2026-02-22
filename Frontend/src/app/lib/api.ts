import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_name");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
};

// Public
export const publicAPI = {
  getLandData: (landId: string) =>
    api.get(`/api/public/land/${landId}`),
  getLandPDF: (landId: string) =>
    `${API_BASE_URL}/api/public/land/pdf/${encodeURIComponent(landId)}`,
};

// Admin
export const adminAPI = {
  createLand: (data: Record<string, unknown>) =>
    api.post("/api/admin/land/create", data),
  fetchLand: (landId: string) =>
    api.get(`/api/admin/land/fetch/${landId}`),
  recomputeIntegrity: (landId: string) =>
    api.post(`/api/admin/land/recompute-integrity/${landId}`),
  getLandCount: () =>
    api.get("/api/admin/land/count"),
  getWitnesses: () =>
    api.get("/api/admin/land/witnesses"),
  getTransferredLands: () =>
    api.get("/api/admin/land/transferred"),
  getLandTransferHistory: (landId: string) =>
    api.get(`/api/admin/land/history/${landId}`),
  transferLand: (landId: string, data: { newOwner: Record<string, unknown>; transferDetails: Record<string, unknown>; changedBy: string }) =>
    api.post(`/api/admin/land/transfer/${landId}`, data),
};

// Integrity
export const integrityAPI = {
  verify: (landId: string) =>
    api.get(`/api/integrity/verify/${landId}`),
};

export default api;