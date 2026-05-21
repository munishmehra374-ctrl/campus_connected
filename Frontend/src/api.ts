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

// --- EVENTS / CAMPUS HUB ---
export const fetchEvents = (params?: {
    type?: string;
    search?: string;
    featured?: boolean;
    approval?: string;
    mine?: boolean;
}) => api.get("/api/events", { params });
export const fetchCampusHubSummary = () => api.get("/api/events/hub-summary");
export const fetchOrganizerDashboard = () => api.get("/api/events/organizer/dashboard");
export const fetchEventById = (id: string) => api.get(`/api/events/${id}`);
export const createEvent = (data: Record<string, unknown>) => api.post("/api/events", data);
export const registerForEvent = (
    id: string,
    body: { fullName: string; userEmail: string; note: string }
) => api.post(`/api/events/${id}/register`, body);
export const updateEventRegistration = (eventId: string, regId: string, status: "approved" | "rejected") =>
    api.patch(`/api/events/${eventId}/registrations/${regId}`, { status });
export const rsvpEvent = (id: string) => api.post(`/api/events/${id}/rsvp`);
export const toggleEventBookmark = (id: string) => api.post(`/api/events/${id}/bookmark`);
export const hideEventFromFeed = (id: string) => api.patch(`/api/events/${id}/hide`);
export const approveEvent = (id: string, featured?: boolean) =>
    api.patch(`/api/events/${id}/approve`, { featured });
export const rejectEvent = (id: string, feedback?: string) =>
    api.patch(`/api/events/${id}/reject`, { feedback });
export const addEventComment = (id: string, content: string) =>
    api.post(`/api/events/${id}/comments`, { content });
export const deleteEvent = (id: string) => api.delete(`/api/events/${id}`);

// --- SENIOR MENTOR VERIFICATION (admin) ---
export const fetchPendingMentorApplications = () => api.get("/api/senior-verification/pending");
export const approveMentorApplication = (id: string) =>
    api.patch(`/api/senior-verification/${id}/approve`);
export const rejectMentorApplication = (id: string, reason?: string) =>
    api.patch(`/api/senior-verification/${id}/reject`, { reason });

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

export const deleteCareerResource = (domainId: string, resourceId: string) =>
    api.delete(`/api/career/${domainId}/resource/${resourceId}`);

// --- MENTORSHIP ---
export const fetchQuestions = () => api.get("/api/questions");
export const fetchQuestionById = (id: string) => api.get(`/api/questions/${id}`);
export const postPublicAnswer = (questionId: string, content: string) =>
    api.post(`/api/questions/${questionId}/public-answers`, { content });
export const openPrivateMentorshipThread = (questionId: string, publicAnswerId: string) =>
    api.post(`/api/questions/${questionId}/private-threads`, { publicAnswerId });
export const sendThreadMessage = (questionId: string, threadId: string, content: string) =>
    api.post(`/api/questions/${questionId}/threads/${threadId}/messages`, { content });
export const deleteMentorshipThread = (questionId: string, threadId: string) =>
    api.delete(`/api/questions/${questionId}/threads/${threadId}`);
export const deleteThreadMessage = (questionId: string, threadId: string, messageId: string) =>
    api.delete(`/api/questions/${questionId}/threads/${threadId}/messages/${messageId}`);
export const markQuestionSolved = (
    questionId: string,
    body?: { helpedBySeniorId?: string; helpedBySeniorName?: string }
) => api.patch(`/api/questions/${questionId}/mark-solved`, body || {});
export const reopenQuestion = (questionId: string) => api.patch(`/api/questions/${questionId}/reopen`);
export const hideQuestionFromFeed = (questionId: string) =>
    api.patch(`/api/questions/${questionId}/hide`);

// --- STUDY RESOURCE HUB (academic materials only) ---
export const fetchStudyResources = () => api.get("/api/resources");
export const fetchPendingStudyResources = () => api.get("/api/resources/pending");
export const uploadStudyResource = (formData: FormData) =>
    api.post("/api/resources", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const approveStudyResource = (id: string) => api.put(`/api/resources/${id}/approve`);
export const rejectStudyResource = (id: string) => api.put(`/api/resources/${id}/reject`);
export const deleteStudyResource = (id: string) => api.delete(`/api/resources/${id}`);
export const trackStudyResourceDownload = (id: string) =>
    api.post(`/api/resources/${id}/download`);

// --- NOTIFICATIONS ---
export const fetchNotifications = () => api.get("/api/notifications");
export const fetchUnreadNotificationCount = () => api.get("/api/notifications/unread-count");
export const markNotificationRead = (id: string) => api.patch(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/api/notifications/read-all");

export default api;