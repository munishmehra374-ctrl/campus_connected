import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
    toggleEventBookmark,
    deleteEvent,
    approveEvent,
    rejectEvent,
} from "../../../api";
import { mapApiEvent, isJoinable, isTrendingEvent } from "../mapEvent";
import Countdown from "./Countdown";
import RegisterModal from "./RegisterModal";
import OrganizerPanel from "./OrganizerPanel";
import type { HubEvent } from "../types";

interface Props {
    event: HubEvent;
    role?: string;
    userId?: string;
    onUpdate: (ev: HubEvent) => void;
    onDelete: (id: string) => void;
    featured?: boolean;
}

const statusClass = (s?: string) =>
    (s || "upcoming").toLowerCase().replace(/\s+/g, "-");

const HubEventCard = ({ event, role, userId, onUpdate, onDelete, featured }: Props) => {
    const [showRegister, setShowRegister] = useState(false);
    const [showOrganizer, setShowOrganizer] = useState(false);
    const [bookmarking, setBookmarking] = useState(false);

    const percent = Math.min(100, Math.round((event.filled / event.capacity) * 100));
    const remaining = event.slotsRemaining ?? Math.max(0, event.capacity - event.filled);
    const reg = event.userRegistration;
    const isPending = event.approvalStatus === "Pending Approval";
    const isRejected = event.approvalStatus === "Rejected";
    const joinable = isJoinable(event);
    const trending = isTrendingEvent(event);

    const handleBookmark = async () => {
        setBookmarking(true);
        try {
            const res = await toggleEventBookmark(event._id);
            onUpdate(mapApiEvent(res.data, userId));
        } catch {
            alert("Could not update bookmark");
        } finally {
            setBookmarking(false);
        }
    };

    const handleApprove = async () => {
        try {
            const res = await approveEvent(event._id, true);
            onUpdate(mapApiEvent(res.data, userId));
        } catch {
            alert("Approval failed");
        }
    };

    const handleReject = async () => {
        const feedback = window.prompt("Rejection feedback for organizer (optional):") || undefined;
        try {
            const res = await rejectEvent(event._id, feedback);
            onUpdate(mapApiEvent(res.data, userId));
        } catch {
            alert("Rejection failed");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await deleteEvent(event._id);
            onDelete(event._id);
        } catch {
            alert("Delete failed");
        }
    };

    const statusLabel = isPending ? "Pending Approval" : isRejected ? "Rejected" : event.status || "Upcoming";

    return (
        <>
            <article
                className={`hub-event-card ${featured ? "featured" : ""} ${isPending ? "hub-card-pending" : ""} ${isRejected ? "hub-card-rejected" : ""}`}
            >
                {event.bannerUrl ? (
                    <div className="hub-event-banner" style={{ backgroundImage: `url(${event.bannerUrl})` }} />
                ) : (
                    <div className="hub-event-banner hub-event-banner-default" />
                )}

                <div className="hub-event-body">
                    <div className="hub-event-top">
                        <span className="hub-type-badge">{event.type}</span>
                        {trending && <span className="hub-trending-badge">🔥 Trending</span>}
                        <span className={`hub-status-badge ${statusClass(statusLabel)}`}>{statusLabel}</span>
                        {event.approvalStatus === "Approved" && (
                            <button
                                type="button"
                                className={`hub-bookmark-btn ${event.isBookmarked ? "active" : ""}`}
                                onClick={handleBookmark}
                                disabled={bookmarking}
                                aria-label={event.isBookmarked ? "Remove bookmark" : "Save event"}
                            >
                                {event.isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                            </button>
                        )}
                    </div>

                    <h3>{event.title}</h3>
                    <p className="hub-event-desc">{event.description}</p>

                    {isRejected && event.rejectionFeedback && (
                        <p className="hub-rejection-note">{event.rejectionFeedback}</p>
                    )}

                    <div className="hub-event-meta">
                        <span>📍 {event.location}</span>
                        <span>
                            📅 {new Date(event.date).toLocaleDateString()} · {event.time}
                        </span>
                        {event.venueMode && <span>🌐 {event.venueMode}</span>}
                    </div>

                    <div className="hub-event-organizer">
                        <span className="hub-org-avatar">{event.organizer.charAt(0)}</span>
                        <span>
                            Organized by <strong>{event.organizer}</strong>
                        </span>
                        {event.status !== "Completed" && event.approvalStatus === "Approved" && (
                            <Countdown date={event.date} />
                        )}
                    </div>

                    {(event.tags || []).length > 0 && (
                        <div className="hub-tags">
                            {event.tags!.map((t) => (
                                <span key={t} className="hub-tag">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    {event.approvalStatus === "Approved" && (
                        <div className="hub-progress-wrap">
                            <div className="hub-progress-labels">
                                <span>{percent}% filled</span>
                                <span>
                                    {event.filled}/{event.capacity} · {remaining} left
                                </span>
                            </div>
                            <div className="hub-progress-bar">
                                <div className="hub-progress-fill" style={{ width: `${percent}%` }} />
                            </div>
                        </div>
                    )}

                    {event.approvedParticipants && event.approvedParticipants.length > 0 && (
                        <div className="hub-avatars-row">
                            <span className="hub-avatars-label">People joined</span>
                            <div className="hub-avatars">
                                {event.approvedParticipants.map((p, i) => (
                                    <span key={p.userId || i} className="hub-avatar" title={p.userName}>
                                        {p.userName.charAt(0)}
                                    </span>
                                ))}
                                {event.filled > event.approvedParticipants.length && (
                                    <span className="hub-avatar hub-avatar-more">
                                        +{event.filled - event.approvedParticipants.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="hub-event-actions">
                        {role === "junior" && (
                            <>
                                {reg?.status === "approved" && (
                                    <span className="hub-joined-badge">✓ You&apos;re registered</span>
                                )}
                                {!reg && joinable && (
                                    <button type="button" className="hub-btn-primary" onClick={() => setShowRegister(true)}>
                                        Join / Participate
                                    </button>
                                )}
                                {!reg && event.approvalStatus === "Approved" && !joinable && event.status !== "Completed" && (
                                    <span className="hub-waitlist-badge">
                                        {event.status === "Full" ? "Event Full" : "Registration closed"}
                                    </span>
                                )}
                            </>
                        )}

                        {event.isOrganizer && event.approvalStatus === "Approved" && (
                            <button type="button" className="hub-btn-secondary" onClick={() => setShowOrganizer(true)}>
                                Manage ({event.filled} joined)
                            </button>
                        )}

                        {role === "admin" && isPending && (
                            <>
                                <button type="button" className="hub-btn-approve" onClick={handleApprove}>
                                    Approve
                                </button>
                                <button type="button" className="hub-btn-reject" onClick={handleReject}>
                                    Reject
                                </button>
                            </>
                        )}

                        {role === "admin" && (
                            <button type="button" className="hub-btn-danger" onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </article>

            {showRegister && (
                <RegisterModal
                    event={event}
                    userId={userId}
                    onClose={() => setShowRegister(false)}
                    onSuccess={onUpdate}
                />
            )}
            {showOrganizer && (
                <OrganizerPanel
                    event={event}
                    userId={userId}
                    onClose={() => setShowOrganizer(false)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default HubEventCard;
