const Event = require("../models/Event");

const LEGACY_TYPE_MAP = {
    Talk: "Seminar",
    Competition: "Competition",
};

function regStatus(reg) {
    if (!reg.status) return "approved";
    return reg.status;
}

function getApprovedCount(regs) {
    return (regs || []).filter((r) => regStatus(r) === "approved").length;
}

function getPendingCount(regs) {
    return (regs || []).filter((r) => regStatus(r) === "pending").length;
}

function getFilledCount(event) {
    const approved = getApprovedCount(event.registrations);
    return approved;
}

function syncFilled(event) {
    event.filled = getFilledCount(event);
}

function normalizeApproval(event) {
    if (!event.approvalStatus) return "Approved";
    return event.approvalStatus;
}

function computeDisplayStatus(event, filled) {
    const approval = normalizeApproval(event);
    if (approval === "Pending Approval") return "Pending Approval";
    if (approval === "Rejected") return "Rejected";
    if (filled >= event.capacity) return "Full";

    const now = new Date();
    const eventDate = new Date(event.date);
    const endOfEventDay = new Date(eventDate);
    endOfEventDay.setHours(23, 59, 59, 999);

    if (now > endOfEventDay) return "Completed";

    const sameDay =
        now.getFullYear() === eventDate.getFullYear() &&
        now.getMonth() === eventDate.getMonth() &&
        now.getDate() === eventDate.getDate();

    if (sameDay) return "Live";

    if (event.registrationDeadline && now > new Date(event.registrationDeadline) && filled < event.capacity) {
        return "Registration Closed";
    }

    return "Upcoming";
}

function registrationOpen(event, filled) {
    const approval = normalizeApproval(event);
    if (approval !== "Approved") return false;
    if (filled >= event.capacity) return false;
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) return false;
    if (computeDisplayStatus(event, filled) === "Completed") return false;
    return true;
}

function findUserRegistration(regs, uid) {
    return (regs || []).find((r) => String(r.userId) === uid) || null;
}

function serializeEvent(event, user) {
    const doc = event.toObject ? event.toObject() : { ...event };
    const regs = doc.registrations || [];
    const filled = getFilledCount(doc);
    const uid = user?._id?.toString();
    const userReg = uid ? findUserRegistration(regs, uid) : null;
    const userRegStatus = userReg ? regStatus(userReg) : null;
    const isRegistered = userRegStatus === "approved";
    const isBookmarked = (doc.bookmarkedBy || []).some((id) => String(id) === uid);
    const approvalStatus = normalizeApproval(doc);
    const displayStatus = computeDisplayStatus(doc, filled);
    const isOwner = uid && String(doc.createdBy) === uid;
    const isAdmin = user?.role === "admin";
    const open = registrationOpen(doc, filled);
    const canRegister =
        user?.role === "junior" &&
        open &&
        (!userReg || userRegStatus === "rejected");
    const approvedParticipants = regs
        .filter((r) => regStatus(r) === "approved")
        .map((r) => ({ userId: String(r.userId), userName: r.userName || "Student" }));
    const fillRatio = doc.capacity > 0 ? filled / doc.capacity : 0;

    const payload = {
        ...doc,
        filled,
        slotsRemaining: Math.max(0, doc.capacity - filled),
        approvalStatus,
        displayStatus,
        isRegistered,
        isBookmarked,
        canRegister,
        isFull: filled >= doc.capacity,
        registrationOpen: open,
        pendingRegistrationsCount: getPendingCount(regs),
        isTrending: approvalStatus === "Approved" && fillRatio >= 0.7,
        approvedParticipants,
        userRegistration: userReg
            ? {
                  _id: userReg._id,
                  userId: String(userReg.userId),
                  userName: userReg.userName,
                  userEmail: userReg.userEmail,
                  note: userReg.note,
                  status: userRegStatus,
                  registeredAt: userReg.registeredAt,
              }
            : null,
    };

    if (isOwner || isAdmin) {
        payload.registrations = regs;
    } else {
        delete payload.registrations;
    }

    return payload;
}

const APPROVED_OR_LEGACY = {
    $or: [{ approvalStatus: "Approved" }, { approvalStatus: { $exists: false } }],
};

function buildVisibilityClause(user, query) {
    const { approval, mine } = query;

    if (mine === "true") {
        return { createdBy: user._id };
    }

    if (user.role === "admin") {
        if (approval === "Pending Approval") return { approvalStatus: "Pending Approval" };
        if (approval === "Rejected") return { approvalStatus: "Rejected" };
        if (approval === "Approved") return APPROVED_OR_LEGACY;
        return {};
    }

    if (user.role === "senior") {
        if (approval === "mine-all") return { createdBy: user._id };
        return {
            $or: [
                { approvalStatus: "Approved" },
                { approvalStatus: { $exists: false } },
                { createdBy: user._id },
            ],
        };
    }

    return APPROVED_OR_LEGACY;
}

function buildListFilter(req) {
    const { type, search, featured } = req.query;
    const clauses = [{ hiddenFor: { $nin: [req.user._id] } }];

    if (type && type !== "All") {
        clauses.push({ type });
    }

    if (search && String(search).trim()) {
        const q = String(search).trim();
        clauses.push({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { organizer: { $regex: q, $options: "i" } },
                { tags: { $regex: q, $options: "i" } },
            ],
        });
    }

    if (featured === "true") {
        clauses.push({ featured: true });
    }

    const visibility = buildVisibilityClause(req.user, req.query);
    if (visibility && Object.keys(visibility).length > 0) {
        clauses.push(visibility);
    }

    return clauses.length === 1 ? clauses[0] : { $and: clauses };
}

exports.getEvents = async (req, res) => {
    try {
        const filter = buildListFilter(req);
        const events = await Event.find(filter).sort({ date: 1 });
        res.json(events.map((e) => serializeEvent(e, req.user)));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error loading events" });
    }
};

exports.getHubSummary = async (req, res) => {
    try {
        const uid = req.user._id;
        const publicFilter = {
            hiddenFor: { $nin: [uid] },
            $or: [{ approvalStatus: "Approved" }, { approvalStatus: { $exists: false } }],
        };

        const allPublic = await Event.find(publicFilter).sort({ date: 1 });
        const serialized = allPublic.map((e) => serializeEvent(e, req.user));

        const now = new Date();
        const upcoming = serialized.filter(
            (e) => e.displayStatus === "Upcoming" || e.displayStatus === "Live"
        );
        const trending = [...serialized]
            .filter((e) => e.isTrending)
            .sort((a, b) => b.filled - a.filled || (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
            .slice(0, 6);
        const featured =
            serialized.find((e) => e.featured && e.displayStatus !== "Completed") ||
            upcoming[0] ||
            serialized[0] ||
            null;

        const myJoined = serialized.filter(
            (e) => e.isRegistered || e.userRegistration?.status === "pending"
        );

        const activity = [];
        for (const ev of serialized.slice(-20)) {
            if (ev.filled > 0) {
                activity.push({
                    type: "registration",
                    eventId: ev._id,
                    eventTitle: ev.title,
                    userName: `${ev.filled} confirmed participants`,
                    at: ev.updatedAt || ev.date,
                });
            }
            for (const c of ev.comments || []) {
                activity.push({
                    type: "comment",
                    eventId: ev._id,
                    eventTitle: ev.title,
                    userName: c.userName,
                    content: c.content,
                    at: c.createdAt,
                });
            }
        }
        activity.sort((a, b) => new Date(b.at) - new Date(a.at));

        let pendingCount = 0;
        if (req.user.role === "admin") {
            pendingCount = await Event.countDocuments({ approvalStatus: "Pending Approval" });
        }

        const bookmarked = serialized.filter((e) => e.isBookmarked);

        res.json({
            featured,
            trending: trending.slice(0, 4),
            upcoming: upcoming.slice(0, 6),
            myJoined,
            bookmarked,
            activity: activity.slice(0, 12),
            pendingCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error loading hub summary" });
    }
};

exports.getOrganizerDashboard = async (req, res) => {
    try {
        const filter =
            req.user.role === "admin"
                ? {}
                : { createdBy: req.user._id };

        const events = await Event.find(filter).sort({ createdAt: -1 });
        const serialized = events.map((e) => serializeEvent(e, req.user));

        const pending = serialized.filter((e) => e.approvalStatus === "Pending Approval");
        const approved = serialized.filter((e) => e.approvalStatus === "Approved");
        const rejected = serialized.filter((e) => e.approvalStatus === "Rejected");

        const totalParticipants = serialized.reduce((sum, e) => sum + e.filled, 0);

        res.json({
            events: serialized,
            pending,
            approved,
            rejected,
            stats: {
                totalEvents: serialized.length,
                pendingCount: pending.length,
                approvedCount: approved.length,
                totalParticipants,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error loading organizer dashboard" });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const hidden = (event.hiddenFor || []).some((id) => id.toString() === req.user._id.toString());
        if (hidden) return res.status(404).json({ message: "Event not found" });

        const serialized = serializeEvent(event, req.user);
        const approval = serialized.approvalStatus;
        const isOwner = String(event.createdBy) === String(req.user._id);
        const isAdmin = req.user.role === "admin";

        if (approval !== "Approved" && !isOwner && !isAdmin) {
            return res.status(403).json({ message: "Event is not public yet" });
        }

        res.json(serialized);
    } catch (err) {
        res.status(500).json({ message: "Error fetching event" });
    }
};

exports.createEvent = async (req, res) => {
    try {
        if (req.user.role !== "senior" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only seniors can host events" });
        }

        const {
            title,
            type,
            description,
            organizer,
            date,
            time,
            location,
            venueMode,
            capacity,
            registrationDeadline,
            bannerImage,
            tags,
        } = req.body;

        const mappedType = LEGACY_TYPE_MAP[type] || type;

        const payload = {
            title,
            type: mappedType,
            description,
            organizer: organizer || req.user.name,
            createdBy: req.user._id,
            date,
            time,
            location,
            venueMode: venueMode || "In-Person",
            capacity,
            registrationDeadline: registrationDeadline || undefined,
            bannerImage: bannerImage || "",
            tags: Array.isArray(tags) ? tags : String(tags || "").split(",").map((t) => t.trim()).filter(Boolean),
            approvalStatus: req.user.role === "admin" ? "Approved" : "Pending Approval",
            filled: 0,
            registrations: [],
        };

        const newEvent = await Event.create(payload);
        res.status(201).json(serializeEvent(newEvent, req.user));
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message || "Creation failed - check fields" });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        if (req.user.role !== "junior") {
            return res.status(403).json({ message: "Only juniors can apply for events" });
        }

        const { fullName, userEmail, note } = req.body;
        if (!fullName?.trim() || !userEmail?.trim() || !note?.trim()) {
            return res.status(400).json({ message: "Full name, email, and reason are required" });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const filled = getFilledCount(event);
        const approval = normalizeApproval(event);

        if (approval !== "Approved") {
            return res.status(400).json({ message: "Event is not open for registration yet" });
        }

        if (!registrationOpen(event, filled)) {
            return res.status(400).json({
                message:
                    filled >= event.capacity
                        ? "Event is full"
                        : "Registration is closed for this event",
            });
        }

        event.registrations = event.registrations || [];
        const existing = event.registrations.find((r) => String(r.userId) === String(req.user._id));
        if (existing) {
            const st = regStatus(existing);
            if (st === "approved") {
                return res.status(400).json({ message: "You are already a confirmed participant" });
            }
            if (st === "pending") {
                return res.status(400).json({ message: "Your application is already pending review" });
            }
        }

        if (existing && regStatus(existing) === "rejected") {
            existing.userName = fullName.trim();
            existing.userEmail = userEmail.trim();
            existing.note = note.trim();
            existing.status = "pending";
            existing.registeredAt = new Date();
        } else {
            event.registrations.push({
                userId: req.user._id,
                userName: fullName.trim(),
                userEmail: userEmail.trim(),
                note: note.trim(),
                status: "pending",
            });
        }

        syncFilled(event);
        await event.save();

        res.json({
            message: "Application submitted. Pending organizer approval.",
            event: serializeEvent(event, req.user),
        });
    } catch (err) {
        res.status(500).json({ message: "Registration failed" });
    }
};

exports.updateEventRegistration = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be approved or rejected" });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const isOwner = String(event.createdBy) === String(req.user._id);
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Only the event organizer can review applications" });
        }

        const reg = (event.registrations || []).id(req.params.regId);
        if (!reg) return res.status(404).json({ message: "Application not found" });

        if (regStatus(reg) !== "pending") {
            return res.status(400).json({ message: "Application has already been reviewed" });
        }

        if (status === "approved") {
            const approvedCount = getApprovedCount(event.registrations);
            if (approvedCount >= event.capacity) {
                return res.status(400).json({ message: "No slots remaining to approve this application" });
            }
        }

        reg.status = status;
        syncFilled(event);
        await event.save();

        res.json(serializeEvent(event, req.user));
    } catch (err) {
        res.status(500).json({ message: "Could not update application" });
    }
};

exports.rsvpEvent = exports.registerForEvent;

exports.toggleBookmark = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const approval = normalizeApproval(event);
        const isOwner = String(event.createdBy) === String(req.user._id);
        const isAdmin = req.user.role === "admin";

        if (req.user.role === "junior" && approval !== "Approved") {
            return res.status(403).json({ message: "Event is not available to save yet" });
        }

        if (approval === "Rejected" && !isOwner && !isAdmin) {
            return res.status(403).json({ message: "Event is not available" });
        }

        event.bookmarkedBy = event.bookmarkedBy || [];
        const idx = event.bookmarkedBy.findIndex((id) => String(id) === String(req.user._id));
        if (idx >= 0) {
            event.bookmarkedBy.splice(idx, 1);
        } else {
            event.bookmarkedBy.push(req.user._id);
        }
        await event.save();
        res.json(serializeEvent(event, req.user));
    } catch (err) {
        res.status(500).json({ message: "Bookmark failed" });
    }
};

exports.hideEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        event.hiddenFor = event.hiddenFor || [];
        const already = event.hiddenFor.some((id) => String(id) === String(req.user._id));
        if (!already) {
            event.hiddenFor.push(req.user._id);
            await event.save();
        }

        res.json({ message: "Event hidden from your feed", eventId: event._id });
    } catch (err) {
        res.status(500).json({ message: "Could not hide event" });
    }
};

exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        event.approvalStatus = "Approved";
        event.rejectionFeedback = "";
        if (req.body.featured === true) event.featured = true;
        await event.save();

        res.json(serializeEvent(event, req.user));
    } catch (err) {
        res.status(500).json({ message: "Approval failed" });
    }
};

exports.rejectEvent = async (req, res) => {
    try {
        const { feedback } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        event.approvalStatus = "Rejected";
        event.rejectionFeedback = feedback || "Event did not meet community guidelines.";
        await event.save();

        res.json(serializeEvent(event, req.user));
    } catch (err) {
        res.status(500).json({ message: "Rejection failed" });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: "Comment required" });

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const approval = normalizeApproval(event);
        if (approval !== "Approved") {
            return res.status(400).json({ message: "Comments only on approved events" });
        }

        event.comments = event.comments || [];
        event.comments.push({
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            content: content.trim(),
        });
        await event.save();

        res.json(serializeEvent(event, req.user));
    } catch (err) {
        res.status(500).json({ message: "Could not add comment" });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event deleted", eventId: event._id });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};
