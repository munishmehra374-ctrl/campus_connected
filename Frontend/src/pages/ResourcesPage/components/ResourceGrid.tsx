import { useEffect, useState } from "react";
import { fetchStudyResources } from "../../../api";
import type { StudyResource } from "../data";
import ResourceCard from "./ResourceCard";

interface Props {
    type: string;
    sem: string;
    search: string;
    role: string;
    userId?: string;
    refreshKey: number;
    onRefresh: () => void;
}

const ResourceGrid = ({ type, sem, search, role, userId, refreshKey, onRefresh }: Props) => {
    const [resources, setResources] = useState<StudyResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        fetchStudyResources()
            .then((res) => setResources(res.data))
            .catch(() => setError("Could not load resources. Please log in and try again."))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const query = search.trim().toLowerCase();
    const userRole = role?.toLowerCase().trim();
    const canSeePending = userRole === "admin" || userRole === "senior";

    const filtered = resources
        .filter((r) => r && r.title)
        .filter((r) => {
            const matchType =
                type === "All" ||
                r.type === type ||
                (type === "PYQ" && r.type === "Paper");
            const matchSem = sem === "All" || r.sem === sem;
            const matchSearch =
                !query ||
                r.title.toLowerCase().includes(query) ||
                r.subject.toLowerCase().includes(query) ||
                r.type.toLowerCase().includes(query);
            const isOwnUpload =
                userId &&
                (typeof r.uploadedBy === "object"
                    ? r.uploadedBy?._id === userId
                    : r.uploadedBy === userId);
            const matchStatus =
                canSeePending || r.status === "approved" || (userRole === "junior" && isOwnUpload);
            return matchType && matchSem && matchSearch && matchStatus;
        });

    if (loading) {
        return (
            <section className="resource-grid-container">
                <p className="count">Loading resources...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="resource-grid-container">
                <p className="grid-error">{error}</p>
            </section>
        );
    }

    return (
        <section className="resource-grid-container">
            <p className="count">Showing {filtered.length} resource{filtered.length !== 1 ? "s" : ""}</p>

            {filtered.length === 0 ? (
                <p className="grid-empty">No resources match your filters.</p>
            ) : (
                <div className="resource-grid">
                    {filtered.map((r) => (
                        <ResourceCard
                            key={r._id}
                            resource={r}
                            role={role}
                            userId={userId}
                            onAction={onRefresh}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ResourceGrid;
