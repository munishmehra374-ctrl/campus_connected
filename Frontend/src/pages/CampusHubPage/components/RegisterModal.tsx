import { useState } from "react";
import { registerForEvent } from "../../../api";
import { mapApiEvent } from "../mapEvent";
import type { HubEvent } from "../types";

interface Props {
    event: HubEvent;
    userId?: string;
    onClose: () => void;
    onSuccess: (updated: HubEvent) => void;
}

const RegisterModal = ({ event, userId, onClose, onSuccess }: Props) => {
    const [fullName, setFullName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const remaining = event.slotsRemaining ?? Math.max(0, event.capacity - event.filled);
    const isFull = event.status === "Full" || remaining <= 0;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim() || !userEmail.trim() || !note.trim()) {
            alert("Please fill in all fields.");
            return;
        }
        setSaving(true);
        try {
            const res = await registerForEvent(event._id, {
                fullName: fullName.trim(),
                userEmail: userEmail.trim(),
                note: note.trim(),
            });
            const updated = mapApiEvent(res.data.event || res.data, userId);
            onSuccess(updated);
            setSubmitted(true);
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : "Application failed";
            alert(msg || "Application failed");
        } finally {
            setSaving(false);
        }
    };

    if (submitted) {
        return (
            <div className="hub-modal-overlay" onClick={onClose}>
                <div className="hub-modal hub-modal-sm hub-modal-success" onClick={(e) => e.stopPropagation()}>
                    <div className="hub-success-icon">✓</div>
                    <h2>Application Submitted</h2>
                    <p className="hub-modal-sub">{event.title}</p>
                    <p className="hub-success-status">Status: Pending Organizer Approval</p>
                    <p className="hub-modal-hint">
                        The event organizer will review your application. You&apos;ll be confirmed once approved.
                    </p>
                    <button type="button" className="hub-btn-primary hub-close-full" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="hub-modal-overlay" onClick={onClose}>
            <form className="hub-modal hub-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
                <h2>Apply for Event</h2>
                <p className="hub-modal-sub">{event.title}</p>
                <p className="hub-modal-hint">
                    {isFull
                        ? "This event has no open slots for new approvals."
                        : `${remaining} slot(s) available · pending applications do not reserve slots`}
                </p>

                <label className="hub-label">Full Name</label>
                <input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />

                <label className="hub-label">Email Address</label>
                <input
                    type="email"
                    placeholder="your@email.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                />

                <label className="hub-label">Why do you want to join this event?</label>
                <textarea
                    rows={4}
                    placeholder="Tell the organizer about your interest and goals…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                />

                <div className="hub-modal-actions">
                    <button type="button" className="hub-btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="hub-btn-primary" disabled={saving || isFull}>
                        {saving ? "Submitting…" : "Submit Application"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterModal;
