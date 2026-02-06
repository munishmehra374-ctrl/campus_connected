import { useState, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import EventCard from "./components/EventCard";
import CreateEventModal from "./components/CreateEventModal";
import "./style.css";

const EventsPage = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState("All");
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/events?type=${filter}`)
            .then(res => {
                setEvents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [filter]);

    return (
        <div className="events-page">
            <section className="events-hero">
                <span className="badge-head">Latest Updates</span>
                <h1>Campus Events</h1>
                <p>Discover workshops, hackathons, and talks happening around campus.</p>
                {user?.role === "senior" && (
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        + Host New Event
                    </button>
                )}
            </section>

            {/* Filter bar that matches grid width */}
            <div className="event-filters">
                {["All", "Workshop", "Hackathon", "Talk", "Competition"].map(f => (
                    <button
                        key={f}
                        className={filter === f ? "active" : ""}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="empty-state">Loading events...</div>
            ) : events.length > 0 ? (
                <div className="events-grid">
                    {events.map((event: any) => (
                        <EventCard key={event._id} event={event} role={user?.role} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>No {filter !== "All" ? filter : ""} events found.</p>
                </div>
            )}

            {showModal && <CreateEventModal onClose={() => setShowModal(false)} />}
        </div>
    );
};
export default EventsPage;