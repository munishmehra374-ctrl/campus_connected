import type { EventItem } from "../data";
import api from "../../../api";

interface Props {
    event: EventItem;
    role?: string;
}

const EventCard = ({ event, role }: Props) => {
    const isFull = event.filled >= event.capacity;
    const percent = Math.min(100, Math.round((event.filled / event.capacity) * 100));

    const handleAction = async () => {
        if (role === "admin") {
            if (window.confirm("Delete this event?")) {
                await api.delete(`/api/events/${event._id}`);
                window.location.reload();
            }
        } else if (role === "junior") {
            try {
                await api.post(`/api/events/${event._id}/rsvp`);
                alert("Enrolled successfully!");
                window.location.reload();
            } catch (err) {
                alert("Could not RSVP. Event might be full.");
            }
        }
    };

    return (
        <div className="event-card">
            <div className="event-top">
                <span className={`badge ${event.type.toLowerCase()}`}>{event.type}</span>
                <span className="organizer">{event.organizer}</span>
            </div>

            <h3>{event.title}</h3>
            <p>{event.description}</p>

            <div className="event-info">
                <span>📍 {event.location}</span>
                <span>📅 {new Date(event.date).toLocaleDateString()} | {event.time}</span>
            </div>

            {/* THE VACANCY LINE (Depicting vacant slots) */}
            <div className="event-progress">
                <span>{percent}% Filled</span>
                <span>{event.filled}/{event.capacity} Slots</span>
            </div>
            <div className="progress-bar">
                {/* The width of this div depicts how many slots are taken */}
                <div
                    className="progress-fill"
                    style={{
                        width: `${percent}%`,
                        background: percent > 85 ? '#ef4444' : 'linear-gradient(135deg, #6366f1, #a855f7)'
                    }}
                />
            </div>

            {role === "junior" && (
                <button className="rsvp-btn" onClick={handleAction} disabled={isFull}>
                    {isFull ? "Event Full" : "RSVP Now"}
                </button>
            )}

            {role === "admin" && (
                <button className="delete-btn" onClick={handleAction}>
                    Delete Event
                </button>
            )}
        </div>
    );
};

export default EventCard;