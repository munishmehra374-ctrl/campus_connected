import { useEffect, useState } from "react";
import {
    approveStudyResource,
    deleteStudyResource,
    fetchPendingStudyResources,
    rejectStudyResource,
} from "../../../api";
import type { StudyResource } from "../data";
import { formatResourceDate, getUploaderName } from "../data";

interface Props {
    refreshKey: number;
    onAction: () => void;
}

const AdminVerifyPanel = ({ refreshKey, onAction }: Props) => {
    const [pending, setPending] = useState<StudyResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);

    const loadPending = async () => {
        setLoading(true);
        try {
            const res = await fetchPendingStudyResources();
            setPending(res.data);
        } catch {
            setPending([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, [refreshKey]);

    const handleApprove = async (id: string) => {
        setActingId(id);
        try {
            await approveStudyResource(id);
            onAction();
            await loadPending();
        } catch {
            alert("Could not approve resource.");
        } finally {
            setActingId(null);
        }
    };

    const handleReject = async (id: string, title: string) => {
        if (!window.confirm(`Reject "${title}"? It will be removed from public view.`)) return;
        setActingId(id);
        try {
            await rejectStudyResource(id);
            onAction();
            await loadPending();
        } catch {
            alert("Could not reject resource.");
        } finally {
            setActingId(null);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}" permanently?`)) return;
        setActingId(id);
        try {
            await deleteStudyResource(id);
            onAction();
            await loadPending();
        } catch {
            alert("Could not delete resource.");
        } finally {
            setActingId(null);
        }
    };

    return (
        <section className="admin-panel">
            <div className="admin-panel-header">
                <h3>Pending Approval</h3>
                <span className="admin-pending-count">{pending.length} awaiting review</span>
            </div>

            {loading && <p className="admin-panel-empty">Loading pending uploads...</p>}

            {!loading && pending.length === 0 && (
                <p className="admin-panel-empty">No junior uploads waiting for approval.</p>
            )}

            {!loading && pending.length > 0 && (
                <ul className="admin-pending-list">
                    {pending.map((r) => (
                        <li key={r._id} className="admin-pending-item">
                            <div className="admin-pending-info">
                                <strong>{r.title}</strong>
                                <span>
                                    {r.type} · {r.subject} · {r.sem}
                                </span>
                                <span className="admin-pending-meta">
                                    {getUploaderName(r.uploadedBy)} · {formatResourceDate(r.createdAt)}
                                </span>
                            </div>
                            <div className="admin-pending-actions">
                                <button
                                    type="button"
                                    className="approve-btn"
                                    disabled={actingId === r._id}
                                    onClick={() => handleApprove(r._id)}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    className="reject-btn"
                                    disabled={actingId === r._id}
                                    onClick={() => handleReject(r._id, r.title)}
                                >
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    className="delete-btn"
                                    disabled={actingId === r._id}
                                    onClick={() => handleDelete(r._id, r.title)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default AdminVerifyPanel;
