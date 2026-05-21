import { useState } from "react";
import { updateEventRegistration } from "../../../api";
import { mapApiEvent } from "../mapEvent";
import type { HubEvent } from "../types";

interface Props {
    event: HubEvent;
    userId?: string;
    onClose: () => void;
    onUpdate: (updated: HubEvent) => void;
}

const OrganizerPanel = ({ event, userId, onClose, onUpdate }: Props) => {
    const [busyId, setBusyId] = useState<string | null>(null);
    const regs = event.registrations || [];
    const pending = regs.filter((r) => r.status === "pending");
    const approved = regs.filter((r) => r.status === "approved");
    const rejected = regs.filter((r) => r.status === "rejected");

    const handleReview = async (regId: string, status: "approved" | "rejected") => {
        setBusyId(regId);
        try {
            const res = await updateEventRegistration(event._id, regId, status);
            onUpdate(mapApiEvent(res.data, userId));
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : "Update failed";
            alert(msg || "Update failed");
        } finally {
            setBusyId(null);
        }
    };

    const formatTime = (iso: string) => {
        if (!iso) return "";
        try {
            return new Date(iso).toLocaleString();
        } catch {
            return iso;
        }
    };

    return (
        <div className="hub-modal-overlay" onClick={onClose}>
            <div className="hub-modal hub-organizer-panel" onClick={(e) => e.stopPropagation()}>
                <h2>Organizer Dashboard</h2>
                <p className="hub-modal-sub">{event.title}</p>

                <div className="hub-org-stats">
                    <div>
                        <strong>{approved.length}</strong>
                        <span>Approved</span>
                    </div>
                    <div>
                        <strong>{event.slotsRemaining ?? Math.max(0, event.capacity - event.filled)}</strong>
                        <span>Slots left</span>
                    </div>
                    <div>
                        <strong>{pending.length}</strong>
                        <span>Pending</span>
                    </div>
                    <div>
                        <strong>{rejected.length}</strong>
                        <span>Rejected</span>
                    </div>
                </div>

                <div className="hub-org-list">
                    <h3>Pending Applications</h3>
                    {pending.length === 0 && (
                        <p className="hub-empty-sm">No pending applications right now.</p>
                    )}
                    {pending.map((r) => (
                        <div key={r._id} className="hub-org-row hub-org-row-pending">
                            <div className="hub-org-applicant">
                                <strong>{r.userName}</strong>
                                <span className="hub-reg-status pending">pending</span>
                                {r.userEmail && <p className="hub-reg-email">{r.userEmail}</p>}
                                {r.note && <p className="hub-reg-note">{r.note}</p>}
                                <p className="hub-reg-time">Applied {formatTime(r.registeredAt)}</p>
                            </div>
                            <div className="hub-org-actions">
                                <button
                                    type="button"
                                    className="hub-btn-approve"
                                    disabled={busyId === r._id}
                                    onClick={() => handleReview(r._id, "approved")}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    className="hub-btn-reject"
                                    disabled={busyId === r._id}
                                    onClick={() => handleReview(r._id, "rejected")}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {approved.length > 0 && (
                    <div className="hub-org-list">
                        <h3>Confirmed Participants</h3>
                        {approved.map((r) => (
                            <div key={r._id} className="hub-org-row">
                                <div>
                                    <strong>{r.userName}</strong>
                                    <span className="hub-reg-status approved">approved</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button type="button" className="hub-btn-ghost hub-close-full" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default OrganizerPanel;
