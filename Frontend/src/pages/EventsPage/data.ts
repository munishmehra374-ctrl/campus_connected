// ✅ Make sure 'export' is here
export interface EventItem {
    _id: string; 
    type: "Workshop" | "Hackathon" | "Talk" | "Competition";
    title: string;
    description: string;
    organizer: string;
    date: string;
    time: string;
    location: string;
    filled: number;
    capacity: number;
}