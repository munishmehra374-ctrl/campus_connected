import type{ EventItem } from "../data"; // Import the fixed interface
import EventCard from "./EventCard";

interface Props {
    events: EventItem[];
    role?: string;
}

const EventList = ({ events, role }: Props) => {
    return (
        <div className="events-grid">
            {events.map((e) => (
                <EventCard key={e._id} event={e} role={role} />
            ))}
        </div>
    );
};

export default EventList;