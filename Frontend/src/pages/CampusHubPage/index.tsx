import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchEvents } from "../../api";
import HubEventCard from "./components/HubEventCard";
import CreateEventModal from "./components/CreateEventModal";
import { mapApiEvent, isApprovedPublic, isJoinable, isEventUpcoming, isTrendingEvent } from "./mapEvent";
import { EVENT_CATEGORIES } from "./types";
import type { HubEvent } from "./types";
import "./style.css";

type HubTab = "all" | "upcoming" | "saved";

const CampusHubPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const userId = user?._id ? String(user._id) : undefined;

    const [events, setEvents] = useState<HubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [eventFilter, setEventFilter] = useState("All");
    const [showCreate, setShowCreate] = useState(false);

    const rawTab = searchParams.get("tab");
    const effectiveTab: HubTab =
        rawTab === "live" || rawTab === "events" || rawTab === "communities"
            ? "all"
            : rawTab === "upcoming" || rawTab === "saved"
              ? rawTab
              : "all";

    const setTab = (t: HubTab) => {
        setSearchParams(t === "all" ? {} : { tab: t });
    };

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchEvents({
                type: eventFilter !== "All" ? eventFilter : undefined,
                search: searchQuery || undefined,
            });
            setEvents((res.data as Record<string, unknown>[]).map((e) => mapApiEvent(e, userId)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [eventFilter, searchQuery, userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const approvedEvents = useMemo(() => events.filter(isApprovedPublic), [events]);

    const pendingEvents = useMemo(
        () => events.filter((e) => e.approvalStatus === "Pending Approval"),
        [events]
    );

    const myPendingEvents = useMemo(
        () =>
            pendingEvents.filter(
                (e) => user?.role === "senior" && e.isOrganizer
            ),
        [pendingEvents, user?.role]
    );

    const upcomingEvents = useMemo(
        () => approvedEvents.filter(isEventUpcoming),
        [approvedEvents]
    );

    const openRegistration = useMemo(() => approvedEvents.filter(isJoinable), [approvedEvents]);

    const trendingEvents = useMemo(
        () =>
            [...approvedEvents]
                .filter(isTrendingEvent)
                .sort((a, b) => b.filled / b.capacity - a.filled / a.capacity)
                .slice(0, 4),
        [approvedEvents]
    );

    const bookmarkedEvents = useMemo(() => events.filter((e) => e.isBookmarked), [events]);

    const myRegistrations = useMemo(
        () =>
            approvedEvents.filter(
                (e) =>
                    e.userRegistration?.status === "approved" ||
                    e.userRegistration?.status === "pending"
            ),
        [approvedEvents]
    );

    const activeEventsCount = useMemo(
        () => approvedEvents.filter((e) => e.status !== "Completed").length,
        [approvedEvents]
    );

    const totalParticipants = useMemo(
        () => approvedEvents.reduce((sum, e) => sum + (e.filled || 0), 0),
        [approvedEvents]
    );

    const filterByTab = (list: HubEvent[]) => {
        if (effectiveTab === "upcoming") return list.filter(isEventUpcoming);
        if (effectiveTab === "saved") return list.filter((e) => e.isBookmarked);
        return list;
    };

    const excludeFromMainGrid = (list: HubEvent[]) => {
        if (effectiveTab !== "all") return list;
        return list.filter((e) => {
            if (e.approvalStatus !== "Pending Approval") return true;
            if (user?.role === "admin") return false;
            if (user?.role === "senior" && e.isOrganizer) return false;
            return true;
        });
    };

    const displayEvents = excludeFromMainGrid(filterByTab(events));

    const handleEventUpdate = (updated: HubEvent) => {
        setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
    };

    const handleEventDelete = (id: string) => {
        setEvents((prev) => prev.filter((e) => e._id !== id));
    };

    const canCreateEvent = user?.role === "senior" || user?.role === "admin";

    const cardProps = {
        role: user?.role,
        userId,
        onUpdate: handleEventUpdate,
        onDelete: handleEventDelete,
    };

    const pendingStat =
        user?.role === "admin"
            ? pendingEvents.length
            : user?.role === "senior"
              ? myPendingEvents.length
              : bookmarkedEvents.length;

    const pendingStatLabel =
        user?.role === "admin"
            ? "Pending Review"
            : user?.role === "senior"
              ? "Awaiting Approval"
              : "Saved";

    return (
        <div className="campus-hub-page">
            <section className="hub-hero">
                <span className="hub-badge">Campus Hub</span>
                <h1>Events & Campus Activities</h1>
                <p>
                    Workshops, hackathons, competitions, mentor sessions, and campus activities —
                    discover and join what&apos;s happening around you.
                </p>

                <div className="hub-stats-row">
                    <div className="hub-stat">
                        <strong>{activeEventsCount}</strong>
                        <span>Active Events</span>
                    </div>
                    <div className="hub-stat">
                        <strong>{totalParticipants}</strong>
                        <span>Participants</span>
                    </div>
                    <div className="hub-stat">
                        <strong>{openRegistration.length}</strong>
                        <span>Open to Join</span>
                    </div>
                    <div className="hub-stat">
                        <strong>{pendingStat}</strong>
                        <span>{pendingStatLabel}</span>
                    </div>
                </div>

                <div className="hub-hero-actions">
                    {canCreateEvent && (
                        <button type="button" className="hub-btn-primary" onClick={() => setShowCreate(true)}>
                            + Host Event
                        </button>
                    )}
                    {user?.role === "admin" && pendingEvents.length > 0 && (
                        <span className="hub-pending-pill">{pendingEvents.length} awaiting approval</span>
                    )}
                </div>
            </section>

            <div className="hub-toolbar">
                <input
                    type="search"
                    className="hub-search"
                    placeholder="Search events, workshops, hackathons, tags…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="hub-main-tabs">
                    {(
                        [
                            { id: "all" as const, label: "All Events" },
                            { id: "upcoming" as const, label: "Upcoming" },
                            { id: "saved" as const, label: "Saved" },
                        ] as const
                    ).map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            className={effectiveTab === t.id ? "active" : ""}
                            onClick={() => setTab(t.id)}
                        >
                            {t.label}
                            {t.id === "saved" && bookmarkedEvents.length > 0 && (
                                <span className="hub-tab-count">{bookmarkedEvents.length}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="hub-category-tabs">
                {["All", ...EVENT_CATEGORIES].map((c) => (
                    <button
                        key={c}
                        type="button"
                        className={eventFilter === c ? "active" : ""}
                        onClick={() => setEventFilter(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="hub-loading">
                    <div className="hub-loading-spinner" />
                    <p>Loading events…</p>
                </div>
            ) : (
                <>
                    {effectiveTab === "all" && user?.role === "admin" && pendingEvents.length > 0 && (
                        <section className="hub-section hub-section-pending">
                            <div className="hub-section-head">
                                <h2>⏳ Pending Approval</h2>
                                <span>{pendingEvents.length} to review</span>
                            </div>
                            <div className="hub-events-grid">
                                {pendingEvents.map((ev) => (
                                    <HubEventCard key={ev._id} event={ev} {...cardProps} />
                                ))}
                            </div>
                        </section>
                    )}

                    {effectiveTab === "all" && user?.role === "senior" && myPendingEvents.length > 0 && (
                        <section className="hub-section hub-section-pending">
                            <div className="hub-section-head">
                                <h2>⏳ Your Pending Events</h2>
                                <span>Visible after admin approval</span>
                            </div>
                            <div className="hub-events-grid">
                                {myPendingEvents.map((ev) => (
                                    <HubEventCard key={ev._id} event={ev} {...cardProps} />
                                ))}
                            </div>
                        </section>
                    )}

                    {effectiveTab === "all" && user?.role === "junior" && myRegistrations.length > 0 && (
                        <section className="hub-section">
                            <div className="hub-section-head">
                                <h2>✓ My Registrations</h2>
                                <span>Events you&apos;ve joined</span>
                            </div>
                            <div className="hub-events-grid">
                                {myRegistrations.map((ev) => (
                                    <HubEventCard key={ev._id} event={ev} {...cardProps} />
                                ))}
                            </div>
                        </section>
                    )}

                    {effectiveTab === "all" && openRegistration.length > 0 && (
                        <section className="hub-section">
                            <div className="hub-section-head">
                                <h2>🎯 Open for Registration</h2>
                                <span>Slots still available</span>
                            </div>
                            <div className="hub-events-grid hub-events-grid-compact">
                                {openRegistration.slice(0, 6).map((ev) => (
                                    <HubEventCard key={ev._id} event={ev} {...cardProps} />
                                ))}
                            </div>
                        </section>
                    )}

                    {effectiveTab === "all" && trendingEvents.length > 0 && (
                        <section className="hub-section">
                            <div className="hub-section-head">
                                <h2>🔥 Trending Activities</h2>
                                <span>Most participation right now</span>
                            </div>
                            <div className="hub-events-grid hub-events-grid-featured">
                                {trendingEvents.map((ev) => (
                                    <HubEventCard key={ev._id} event={ev} {...cardProps} featured />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="hub-section">
                        <div className="hub-section-head">
                            <h2>
                                {effectiveTab === "upcoming"
                                    ? "📅 Upcoming Events"
                                    : effectiveTab === "saved"
                                      ? "🔖 Saved Events"
                                      : "📅 All Campus Events"}
                            </h2>
                            <span>{displayEvents.length} shown</span>
                        </div>
                        {displayEvents.length === 0 ? (
                            <p className="hub-empty">
                                {effectiveTab === "saved"
                                    ? "No saved events yet. Bookmark events you want to track."
                                    : "No events match your filters."}
                            </p>
                        ) : (
                            <div className="hub-events-grid">
                                {displayEvents.map((ev) => (
                                    <HubEventCard key={ev._id} event={ev} {...cardProps} />
                                ))}
                            </div>
                        )}
                    </section>

                    {effectiveTab === "all" && approvedEvents.length > 0 && (
                        <section className="hub-section hub-activity">
                            <div className="hub-section-head">
                                <h2>⚡ Activity Feed</h2>
                                <span>Recent campus participation</span>
                            </div>
                            <ul className="hub-activity-list">
                                {[...approvedEvents]
                                    .sort((a, b) => b.filled - a.filled)
                                    .slice(0, 8)
                                    .map((ev) => (
                                        <li key={ev._id}>
                                            <span className={`hub-activity-dot ${statusClass(ev.status)}`} />
                                            <div>
                                                <strong>{ev.title}</strong>
                                                <span>
                                                    {ev.filled} joined · {ev.type} ·{" "}
                                                    {new Date(ev.date).toLocaleDateString()} · {ev.organizer}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </section>
                    )}
                </>
            )}

            {showCreate && (
                <CreateEventModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        loadData();
                        alert(
                            user?.role === "admin"
                                ? "Event published."
                                : "Event submitted for admin approval."
                        );
                    }}
                />
            )}
        </div>
    );
};

function statusClass(s?: string) {
    return (s || "upcoming").toLowerCase().replace(/\s+/g, "-");
}

export default CampusHubPage;
