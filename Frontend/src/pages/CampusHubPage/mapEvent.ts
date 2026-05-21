import type { ApprovalStatus, EventStatus, HubEvent } from "./types";

type ApiEvent = Record<string, unknown>;

type ApiReg = {
    _id?: string;
    userId: string;
    userName: string;
    userEmail?: string;
    note?: string;
    status?: string;
    registeredAt?: string;
};

function normalizeApproval(raw: ApiEvent): ApprovalStatus {
    const status = raw.approvalStatus;
    if (status === "Pending Approval" || status === "Rejected") return status;
    return "Approved";
}

function toDisplayStatus(raw: ApiEvent): EventStatus {
    const display = String(raw.displayStatus || "");
    const valid: EventStatus[] = [
        "Upcoming",
        "Live",
        "Completed",
        "Full",
        "Pending Approval",
        "Rejected",
        "Registration Closed",
    ];
    if (valid.includes(display as EventStatus)) return display as EventStatus;
    return "Upcoming";
}

function mapReg(r: ApiReg) {
    const status = (r.status || "approved") as "pending" | "approved" | "rejected" | "waitlist";
    return {
        _id: String(r._id || r.userId),
        userId: String(r.userId),
        userName: r.userName || "Student",
        userEmail: r.userEmail,
        note: r.note,
        status,
        registeredAt: String(r.registeredAt || ""),
    };
}

export function mapApiEvent(raw: ApiEvent, userId?: string): HubEvent {
    const filled = Number(raw.filled ?? 0);
    const capacity = Number(raw.capacity ?? 0);
    const regs = (raw.registrations as ApiReg[]) || [];
    const createdBy = raw.createdBy ? String(raw.createdBy) : undefined;
    const approvalStatus = normalizeApproval(raw);

    const userRegRaw = raw.userRegistration as ApiReg | null | undefined;
    const userRegistration = userRegRaw ? mapReg(userRegRaw) : null;

    return {
        _id: String(raw._id),
        type: String(raw.type) as HubEvent["type"],
        title: String(raw.title),
        description: String(raw.description),
        organizer: String(raw.organizer),
        organizerId: createdBy,
        date: String(raw.date),
        time: String(raw.time),
        location: String(raw.location),
        venueMode: raw.venueMode ? String(raw.venueMode) : undefined,
        filled,
        capacity,
        slotsRemaining: Number(raw.slotsRemaining ?? Math.max(0, capacity - filled)),
        registrationDeadline: raw.registrationDeadline ? String(raw.registrationDeadline) : null,
        tags: (raw.tags as string[]) || [],
        bannerUrl: String(raw.bannerImage || ""),
        status: toDisplayStatus(raw),
        approvalStatus,
        featured: Boolean(raw.featured),
        registrations: regs.map(mapReg),
        approvedParticipants: (raw.approvedParticipants as { userName: string; userId: string }[]) || [],
        pendingCount: Number(raw.pendingRegistrationsCount ?? 0),
        waitlistCount: 0,
        userRegistration,
        isBookmarked: Boolean(raw.isBookmarked),
        isOrganizer: Boolean(userId && createdBy && createdBy === userId),
        canRegister: Boolean(raw.canRegister),
        isTrending: Boolean(raw.isTrending),
        rejectionFeedback: raw.rejectionFeedback ? String(raw.rejectionFeedback) : undefined,
    };
}

export function isApprovedPublic(event: HubEvent): boolean {
    return event.approvalStatus === "Approved";
}

export function isEventUpcoming(event: HubEvent): boolean {
    if (!isApprovedPublic(event)) return false;
    if (event.status === "Completed" || event.status === "Rejected") return false;

    const now = new Date();
    const eventDate = new Date(event.date);
    const endOfEventDay = new Date(eventDate);
    endOfEventDay.setHours(23, 59, 59, 999);
    return now <= endOfEventDay;
}

export function isJoinable(event: HubEvent): boolean {
    return (
        isApprovedPublic(event) &&
        Boolean(event.canRegister) &&
        event.status !== "Completed" &&
        event.status !== "Rejected"
    );
}

export function isTrendingEvent(event: HubEvent): boolean {
    return isApprovedPublic(event) && Boolean(event.isTrending);
}
