export type EventType =
    | "Workshop"
    | "Hackathon"
    | "Talk"
    | "Competition"
    | "Seminar"
    | "Mentor Session"
    | "Community Meetup"
    | "Coding Contest";

export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";

export type EventStatus =
    | "Upcoming"
    | "Live"
    | "Completed"
    | "Full"
    | "Pending Approval"
    | "Rejected"
    | "Registration Closed";

export type RegistrationStatus = "pending" | "approved" | "rejected" | "waitlist";

export interface EventRegistration {
    _id: string;
    userId: string;
    userName: string;
    userEmail?: string;
    note?: string;
    status: RegistrationStatus;
    registeredAt: string;
}

export interface HubEvent {
    _id: string;
    type: EventType;
    title: string;
    description: string;
    organizer: string;
    organizerId?: string;
    date: string;
    time: string;
    location: string;
    venueMode?: string;
    filled: number;
    capacity: number;
    slotsRemaining?: number;
    registrationDeadline?: string | null;
    tags?: string[];
    bannerUrl?: string;
    status?: EventStatus;
    approvalStatus?: ApprovalStatus;
    featured?: boolean;
    registrations?: EventRegistration[];
    approvedParticipants?: { userName: string; userId: string }[];
    pendingCount?: number;
    waitlistCount?: number;
    userRegistration?: EventRegistration | null;
    isBookmarked?: boolean;
    isOrganizer?: boolean;
    canRegister?: boolean;
    isTrending?: boolean;
    rejectionFeedback?: string;
}

export const EVENT_CATEGORIES: EventType[] = [
    "Workshop",
    "Hackathon",
    "Coding Contest",
    "Seminar",
    "Mentor Session",
    "Competition",
    "Community Meetup",
    "Talk",
];
