import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

// --- SOCIETIES MODULE ---
export const fetchSocieties = () => api.get("/api/societies");
export const fetchSocietyById = (id: string) => api.get(`/api/societies/${id}`);
export const toggleJoinSociety = (id: string) => api.post(`/api/societies/${id}/toggle-join`);

// This is the missing export that caused your error
export const assignSeniorLead = (id: string) => api.post(`/api/societies/${id}/assign-senior`);

export const addWorkshopApi = (id: string, data: any) => api.post(`/api/societies/${id}/workshops`, data);
export const deleteWorkshopApi = (id: string, wsId: string) => api.delete(`/api/societies/${id}/workshops/${wsId}`);
export const deleteSociety = (id: string) => api.delete(`/api/societies/${id}`);

// --- CAREER MODULE ---
export const fetchCareers = () => api.get("/api/career");
export const fetchCareerById = (id: string) => api.get(`/api/career/${id}`);
export const addCareerTip = (id: string, text: string) => api.post(`/api/career/${id}/tip`, { text });

// For PDF/YouTube Resource Uploads
export const addResourceApi = (id: string, formData: FormData) =>
    api.post(`/api/career/${id}/resource`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const deleteCareerPath = (id: string) => api.delete(`/api/career/${id}`);

export default api;