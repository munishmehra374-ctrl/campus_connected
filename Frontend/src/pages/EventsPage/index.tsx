import { useState, useEffect, useCallback } from "react";
import { Sparkles, Search, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    fetchEvents,
    fetchCampusHubSummary,
    fetchOrganizerDashboard,
} from "../../api";
import type { EventItem, HubSummary, OrganizerDashboard as DashboardData } from "./data";
import { EVENT_CATEGORIES } from "./data";
import { formatEventDate, getCountdown } from "./utils";
import EventCard from "./components/EventCard";
import CreateEventModal from "./components/CreateEventModal";
import OrganizerDashboard from "./components/OrganizerDashboard";
import ActivityFeed from "./components/ActivityFeed";
import "./style.css";

const EventsPage = () => {
    const { user } = useAuth();
    const role = user?.role;

    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [adminFilter, setAdminFilter] = useState("");
    const [events, setEvents] = useState<EventItem[]>([]);
    const [summary, setSummary] = useState<HubSummary | null>(null);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {
                type: filter,
                search: search.trim(),
            };
            if (role === "admin" && adminFilter) params.approval = adminFilter;

            const [eventsRes, summaryRes] = await Promise.all([
                fetchEvents(params),
                fetchCampusHubSummary(),
            ]);
            setEvents(eventsRes.data);
            setSummary(summaryRes.data);

            if (role === "senior" || role === "admin") {
                const dashRes = await fetchOrganizerDashboard();
                setDashboard(dashRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filter, search, adminFilter, role]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleHide = (id: string) => {
        setEvents((prev) => prev.filter((e) => e._id !== id));
    };

    const handleEventUpdate = (updated: EventItem) => {
        setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        loadAll();
    };

    const featured = summary?.featured;
    const canHost = role === "senior" || role === "admin";

    return (
        <div className="campus-hub-page">
            {/* Hero */}
            <section className="hub-hero">
                <span className="hub-badge">
                    <Sparkles size={14} /> Campus Hub
                </span>
                <h1>Campus Activity Ecosystem</h1>
                <p>
                    Discover hackathons, workshops, mentor sessions, and coding contests. Join events,
                    track your participation, and connect with campus organizers.
                </p>
                <div className="hub-hero-actions">
                    {canHost && (
                        <button type="button" className="hub-btn primary lg" onClick={() => setShowModal(true)}>
                            + Host Event
                        </button>
                    )}
                    {(role === "senior" || role === "admin") && (
                        <button
                            type="button"
                            className="hub-btn ghost lg"
                            onClick={() => setShowDashboard(!showDashboard)}
                        >
                            <LayoutDashboard size={18} />
                            {showDashboard ? "Hide Dashboard" : "Organizer Dashboard"}
                        </button>
                    )}
                    {role === "admin" && summary && summary.pendingCount > 0 && (
                        <span className="pending-pill">{summary.pendingCount} pending approval</span>
                    )}
                </div>

                {featured && (
                    <div className="featured-event glass-panel">
                        {featured.bannerImage && (
                            <div
                                className="featured-banner"
                                style={{ backgroundImage: `url(${featured.bannerImage})` }}
                            />
                        )}
                        <div className="featured-content">
                            <span className="featured-label">Featured Event</span>
                            <h2>{featured.title}</h2>
                            <p>{featured.description?.slice(0, 160)}
                                {(featured.description?.length || 0) > 160 ? "…" : ""}</p>
                            <div className="featured-meta">
                                <span>{featured.type}</span>
                                <span>{formatEventDate(featured.date)}</span>
                                {getCountdown(featured.date, featured.time) && (
                                    <span className="countdown-pill">
                                        {getCountdown(featured.date, featured.time)} left
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <div className="hub-main">
                <div className="hub-content">
                    {/* Search & filters */}
                    <div className="hub-toolbar glass-panel">
                        <div className="hub-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search events, tags, organizers…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="category-filters">
                            {EVENT_CATEGORIES.map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    className={filter === f ? "active" : ""}
                                    onClick={() => setFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        {role === "admin" && (
                            <div className="admin-filters">
                                <button
                                    type="button"
                                    className={adminFilter === "" ? "active" : ""}
                                    onClick={() => setAdminFilter("")}
                                >
                                    All (Admin)
                                </button>
                                <button
                                    type="button"
                                    className={adminFilter === "Pending Approval" ? "active" : ""}
                                    onClick={() => setAdminFilter("Pending Approval")}
                                >
                                    Pending
                                </button>
                                <button
                                    type="button"
                                    className={adminFilter === "Approved" ? "active" : ""}
                                    onClick={() => setAdminFilter("Approved")}
                                >
                                    Approved
                                </button>
                            </div>
                        )}
                    </div>

                    {showDashboard && (role === "senior" || role === "admin") && (
                        <OrganizerDashboard
                            data={dashboard}
                            role={role}
                            onUpdate={loadAll}
                            onHide={handleHide}
                        />
                    )}

                    {/* Trending */}
                    {summary && summary.trending.length > 0 && (
                        <section className="hub-section">
                            <div className="section-header">
                                <h2>Trending Events</h2>
                                <p>Most popular activities on campus right now</p>
                            </div>
                            <div className="hub-events-row">
                                {summary.trending.map((ev) => (
                                    <EventCard
                                        key={ev._id}
                                        event={ev}
                                        role={role}
                                        onUpdate={handleEventUpdate}
                                        onHide={handleHide}
                                        compact
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming */}
                    {summary && summary.upcoming.length > 0 && (
                        <section className="hub-section">
                            <div className="section-header">
                                <h2>Upcoming Events</h2>
                                <p>Workshops and sessions starting soon</p>
                            </div>
                            <div className="hub-events-row">
                                {summary.upcoming.map((ev) => (
                                    <EventCard
                                        key={ev._id}
                                        event={ev}
                                        role={role}
                                        onUpdate={handleEventUpdate}
                                        onHide={handleHide}
                                        compact
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recently joined */}
                    {summary && summary.myJoined.length > 0 && (
                        <section className="hub-section">
                            <div className="section-header">
                                <h2>Recently Joined</h2>
                                <p>Events you&apos;re registered for</p>
                            </div>
                            <div className="hub-events-grid">
                                {summary.myJoined.map((ev) => (
                                    <EventCard
                                        key={ev._id}
                                        event={ev}
                                        role={role}
                                        onUpdate={handleEventUpdate}
                                        onHide={handleHide}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Main feed */}
                    <section className="hub-section">
                        <div className="section-header">
                            <h2>Event Feed</h2>
                            <p>Explore and join campus activities</p>
                        </div>
                        {loading ? (
                            <p className="hub-empty">Loading campus events…</p>
                        ) : events.length === 0 ? (
                            <p className="hub-empty">No events found. {canHost ? "Be the first to host one!" : ""}</p>
                        ) : (
                            <div className="hub-events-grid">
                                {events.map((ev) => (
                                    <EventCard
                                        key={ev._id}
                                        event={ev}
                                        role={role}
                                        onUpdate={handleEventUpdate}
                                        onHide={handleHide}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Bookmarked */}
                    {summary && summary.bookmarked.length > 0 && (
                        <section className="hub-section">
                            <div className="section-header">
                                <h2>Saved Events</h2>
                            </div>
                            <div className="hub-events-grid">
                                {summary.bookmarked.map((ev) => (
                                    <EventCard
                                        key={ev._id}
                                        event={ev}
                                        role={role}
                                        onUpdate={handleEventUpdate}
                                        onHide={handleHide}
                                        compact
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="hub-sidebar">
                    <ActivityFeed activity={summary?.activity || []} />
                </aside>
            </div>

            {showModal && (
                <CreateEventModal
                    onClose={() => setShowModal(false)}
                    onSuccess={loadAll}
                />
            )}
        </div>
    );
};

export default EventsPage;
