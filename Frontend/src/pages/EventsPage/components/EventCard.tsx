import { useState } from "react";
import {
    MapPin,
    Calendar,
    Bookmark,
    BookmarkCheck,
    EyeOff,
    Users,
    MessageSquare,
    Trash2,
    Check,
    X,
} from "lucide-react";
import type { EventItem } from "../data";
import {
    registerForEvent,
    toggleEventBookmark,
    hideEventFromFeed,
    approveEvent,
    rejectEvent,
    deleteEvent,
    addEventComment,
} from "../../../api";
import { formatEventDate, getCountdown, statusBadgeClass } from "../utils";

interface Props {
    event: EventItem;
    role?: string;
    onUpdate?: (e: EventItem) => void;
    onHide?: (id: string) => void;
    compact?: boolean;
}

const EventCard = ({ event, role, onUpdate, onHide, compact = false }: Props) => {
    const [loading, setLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const percent = Math.min(100, Math.round((event.filled / event.capacity) * 100));
    const countdown = getCountdown(event.date, event.time);
    const showPending = event.approvalStatus === "Pending Approval";
    const showRejected = event.approvalStatus === "Rejected";

    const refresh = (updated: EventItem) => onUpdate?.(updated);

    const handleRegister = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await registerForEvent(event._id);
            refresh(res.data);
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : "Registration failed";
            setError(msg || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async () => {
        try {
            const res = await toggleEventBookmark(event._id);
            refresh(res.data);
        } catch {
            setError("Could not update bookmark");
        }
    };

    const handleHide = async () => {
        if (!window.confirm("Remove this event from your feed? Others will still see it.")) return;
        try {
            await hideEventFromFeed(event._id);
            onHide?.(event._id);
        } catch {
            setError("Could not hide event");
        }
    };

    const handleApprove = async () => {
        try {
            const res = await approveEvent(event._id, true);
            refresh(res.data);
        } catch {
            alert("Approval failed");
        }
    };

    const handleReject = async () => {
        const feedback = window.prompt("Rejection feedback for organizer (optional):") || undefined;
        try {
            const res = await rejectEvent(event._id, feedback);
            refresh(res.data);
        } catch {
            alert("Rejection failed");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this event permanently? All registrations will be removed.")) return;
        try {
            await deleteEvent(event._id);
            onHide?.(event._id);
        } catch {
            alert("Delete failed");
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            const res = await addEventComment(event._id, comment.trim());
            setComment("");
            refresh(res.data);
        } catch {
            setError("Could not post comment");
        }
    };

    const joinLabel = event.isRegistered
        ? "Registered ✓"
        : event.isFull || event.displayStatus === "Full"
          ? "Event Full"
          : event.displayStatus === "Registration Closed"
            ? "Registration Closed"
            : loading
              ? "Joining…"
              : "Join / Participate";

    return (
        <article className={`hub-event-card ${compact ? "compact" : ""} ${showPending ? "pending-card" : ""}`}>
            {event.bannerImage && (
                <div
                    className="event-banner"
                    style={{ backgroundImage: `url(${event.bannerImage})` }}
                />
            )}

            <div className="event-card-body">
                <div className="event-card-top">
                    <span className={`type-badge type-${event.type.toLowerCase().replace(/\s+/g, "-")}`}>
                        {event.type}
                    </span>
                    <span className={statusBadgeClass(event.displayStatus)}>{event.displayStatus}</span>
                    {showPending && <span className="status-badge status-pending-approval">Pending Approval</span>}
                    {showRejected && <span className="status-badge status-rejected">Rejected</span>}
                </div>

                <h3>{event.title}</h3>
                {!compact && <p className="event-desc">{event.description}</p>}

                {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                        {event.tags.map((t) => (
                            <span key={t} className="event-tag">
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="organizer-preview">
                    <div className="organizer-avatar">{event.organizer?.charAt(0) || "O"}</div>
                    <div>
                        <span className="organizer-label">Organizer</span>
                        <span className="organizer-name">{event.organizer}</span>
                    </div>
                </div>

                <div className="event-meta-grid">
                    <span>
                        <MapPin size={14} /> {event.location}
                        {event.venueMode && <em className="venue-mode"> · {event.venueMode}</em>}
                    </span>
                    <span>
                        <Calendar size={14} /> {formatEventDate(event.date)} · {event.time}
                    </span>
                    {countdown && event.displayStatus === "Upcoming" && (
                        <span className="countdown-pill">Starts in {countdown}</span>
                    )}
                </div>

                <div className="slot-progress">
                    <div className="slot-labels">
                        <span>
                            <Users size={14} /> {event.filled}/{event.capacity} registered
                        </span>
                        <span>{event.slotsRemaining ?? event.capacity - event.filled} slots left</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${percent}%`,
                                background:
                                    percent >= 100
                                        ? "#ef4444"
                                        : percent > 85
                                          ? "#f59e0b"
                                          : "linear-gradient(90deg, #6366f1, #a855f7)",
                            }}
                        />
                    </div>
                </div>

                {showRejected && event.rejectionFeedback && (
                    <p className="rejection-note">Feedback: {event.rejectionFeedback}</p>
                )}

                {error && <p className="event-error">{error}</p>}

                <div className="event-card-actions">
                    {role === "junior" && (
                        <button
                            type="button"
                            className="hub-btn primary"
                            onClick={handleRegister}
                            disabled={loading || !event.canRegister || event.isRegistered}
                        >
                            {joinLabel}
                        </button>
                    )}

                    <button
                        type="button"
                        className={`hub-btn icon-btn ${event.isBookmarked ? "active" : ""}`}
                        onClick={handleBookmark}
                        title="Save event"
                    >
                        {event.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>

                    <button type="button" className="hub-btn icon-btn" onClick={handleHide} title="Hide from feed">
                        <EyeOff size={16} />
                    </button>

                    {!compact && (
                        <button
                            type="button"
                            className="hub-btn ghost"
                            onClick={() => setShowComments(!showComments)}
                        >
                            <MessageSquare size={14} />
                            {event.comments?.length || 0}
                        </button>
                    )}

                    {role === "admin" && showPending && (
                        <>
                            <button type="button" className="hub-btn success" onClick={handleApprove}>
                                <Check size={14} /> Approve
                            </button>
                            <button type="button" className="hub-btn danger-outline" onClick={handleReject}>
                                <X size={14} /> Reject
                            </button>
                        </>
                    )}

                    {role === "admin" && (
                        <button type="button" className="hub-btn danger-outline" onClick={handleDelete}>
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                {showComments && (
                    <div className="event-comments">
                        {(event.comments || []).map((c) => (
                            <div key={c._id} className="comment-item">
                                <strong>{c.userName}</strong>
                                <span className="comment-role">{c.userRole}</span>
                                <p>{c.content}</p>
                            </div>
                        ))}
                        <form onSubmit={handleComment} className="comment-form">
                            <input
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add to discussion…"
                            />
                            <button type="submit" className="hub-btn primary sm">
                                Post
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </article>
    );
};

export default EventCard;
