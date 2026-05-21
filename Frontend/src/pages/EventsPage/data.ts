export const EVENT_CATEGORIES = [
    "All",
    "Hackathon",
    "Workshop",
    "Coding Contest",
    "Seminar",
    "Mentor Session",
    "Competition",
    "Community Meetup",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface EventRegistration {
    _id?: string;
    userId: string;
    userName: string;
    registeredAt: string;
}

export interface EventComment {
    _id: string;
    userId: string;
    userName: string;
    userRole: string;
    content: string;
    createdAt: string;
}

export interface EventItem {
    _id: string;
    type: string;
    title: string;
    description: string;
    organizer: string;
    createdBy?: string;
    date: string;
    time: string;
    location: string;
    venueMode?: string;
    capacity: number;
    filled: number;
    slotsRemaining?: number;
    registrationDeadline?: string;
    bannerImage?: string;
    tags?: string[];
    approvalStatus?: string;
    rejectionFeedback?: string;
    featured?: boolean;
    displayStatus?: string;
    isRegistered?: boolean;
    isBookmarked?: boolean;
    canRegister?: boolean;
    isFull?: boolean;
    registrationOpen?: boolean;
    registrations?: EventRegistration[];
    comments?: EventComment[];
    createdAt?: string;
}

export interface HubSummary {
    featured: EventItem | null;
    trending: EventItem[];
    upcoming: EventItem[];
    myJoined: EventItem[];
    bookmarked: EventItem[];
    activity: {
        type: string;
        eventId: string;
        eventTitle: string;
        userName?: string;
        content?: string;
        at: string;
    }[];
    pendingCount: number;
}

export interface OrganizerDashboard {
    events: EventItem[];
    pending: EventItem[];
    approved: EventItem[];
    rejected: EventItem[];
    stats: {
        totalEvents: number;
        pendingCount: number;
        approvedCount: number;
        totalParticipants: number;
    };
}
