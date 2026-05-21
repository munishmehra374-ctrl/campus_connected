export const RESOURCE_CATEGORIES = [
    "Notes",
    "PYQ",
    "Assignment",
    "Lab Manual",
    "Cheat Sheet",
    "Interview Prep",
    "Study Material",
] as const;

export const FILTER_TABS = ["All", ...RESOURCE_CATEGORIES] as const;

export const SEMESTERS = [
    "All",
    "Sem 1",
    "Sem 2",
    "Sem 3",
    "Sem 4",
    "Sem 5",
    "Sem 6",
    "Sem 7",
    "Sem 8",
] as const;

export type ResourceStatus = "pending" | "approved" | "rejected";
export type UploaderRole = "junior" | "senior" | "admin";

export interface StudyResourceUser {
    _id: string;
    name: string;
    role?: string;
}

export interface StudyResource {
    _id: string;
    title: string;
    subject: string;
    type: string;
    sem: string;
    fileUrl: string;
    status: ResourceStatus;
    uploaderRole: UploaderRole;
    downloadCount: number;
    uploadedBy: StudyResourceUser | string;
    createdAt: string;
    updatedAt?: string;
}

export const getUploaderName = (uploadedBy: StudyResource["uploadedBy"]) => {
    if (!uploadedBy) return "Unknown";
    if (typeof uploadedBy === "string") return "Community Member";
    return uploadedBy.name || "Community Member";
};

export const formatResourceDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const roleBadgeLabel = (role: UploaderRole) => {
    switch (role) {
        case "admin":
            return "Admin";
        case "senior":
            return "Senior";
        default:
            return "Junior";
    }
};
