import type { HubSummary } from "../data";

interface Props {
    activity: HubSummary["activity"];
}

const ActivityFeed = ({ activity }: Props) => {
    if (!activity?.length) {
        return (
            <section className="activity-feed glass-panel">
                <h3>Activity Feed</h3>
                <p className="muted">No recent campus activity yet. Join an event to get started!</p>
            </section>
        );
    }

    return (
        <section className="activity-feed glass-panel">
            <h3>Activity Feed</h3>
            <ul className="activity-list">
                {activity.map((item, i) => (
                    <li key={`${item.eventId}-${i}`} className="activity-item">
                        <span className={`activity-dot ${item.type}`} />
                        <div>
                            <p>
                                {item.type === "registration" ? (
                                    <>
                                        <strong>{item.userName}</strong> joined{" "}
                                        <em>{item.eventTitle}</em>
                                    </>
                                ) : (
                                    <>
                                        <strong>{item.userName}</strong> commented on{" "}
                                        <em>{item.eventTitle}</em>
                                    </>
                                )}
                            </p>
                            {item.content && <p className="activity-preview">{item.content}</p>}
                            <time>{new Date(item.at).toLocaleString()}</time>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ActivityFeed;
