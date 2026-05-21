import type { OrganizerDashboard as DashboardData } from "../data";
import EventCard from "./EventCard";

interface Props {
    data: DashboardData | null;
    role?: string;
    onUpdate: () => void;
    onHide: (id: string) => void;
}

const OrganizerDashboard = ({ data, role, onUpdate, onHide }: Props) => {
    if (!data) return null;

    const { stats, pending, approved, rejected } = data;

    return (
        <section className="organizer-dashboard glass-panel">
            <div className="section-header">
                <h2>Organizer Dashboard</h2>
                <p>Track your hosted events, approvals, and participant analytics</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <span className="stat-value">{stats.totalEvents}</span>
                    <span className="stat-label">Total Events</span>
                </div>
                <div className="stat-card highlight">
                    <span className="stat-value">{stats.pendingCount}</span>
                    <span className="stat-label">Pending Approval</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{stats.approvedCount}</span>
                    <span className="stat-label">Approved</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{stats.totalParticipants}</span>
                    <span className="stat-label">Total Participants</span>
                </div>
            </div>

            {pending.length > 0 && (
                <div className="dashboard-group">
                    <h3>Awaiting Admin Approval</h3>
                    <div className="dashboard-events">
                        {pending.map((ev) => (
                            <EventCard
                                key={ev._id}
                                event={ev}
                                role={role}
                                onUpdate={() => onUpdate()}
                                onHide={onHide}
                                compact
                            />
                        ))}
                    </div>
                </div>
            )}

            {approved.length > 0 && (
                <div className="dashboard-group">
                    <h3>Approved & Live Events</h3>
                    <div className="dashboard-events">
                        {approved.map((ev) => (
                            <EventCard
                                key={ev._id}
                                event={ev}
                                role={role}
                                onUpdate={() => onUpdate()}
                                onHide={onHide}
                                compact
                            />
                        ))}
                    </div>
                </div>
            )}

            {rejected.length > 0 && (
                <div className="dashboard-group">
                    <h3>Rejected Events</h3>
                    <div className="dashboard-events">
                        {rejected.map((ev) => (
                            <EventCard
                                key={ev._id}
                                event={ev}
                                role={role}
                                onUpdate={() => onUpdate()}
                                onHide={onHide}
                                compact
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default OrganizerDashboard;
