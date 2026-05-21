const mongoose = require("mongoose");

const EVENT_CATEGORIES = [
    "Hackathon",
    "Workshop",
    "Coding Contest",
    "Seminar",
    "Mentor Session",
    "Competition",
    "Community Meetup",
    "Talk", // legacy
];

const registrationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, default: "" },
        userEmail: { type: String, default: "" },
        note: { type: String, default: "" },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "waitlist"],
            default: "pending",
        },
        registeredAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const commentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, default: "" },
        userRole: { type: String, default: "junior" },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const eventSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: EVENT_CATEGORIES,
            required: true,
            index: true,
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        organizer: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        location: { type: String, required: true },
        venueMode: {
            type: String,
            enum: ["In-Person", "Online", "Hybrid"],
            default: "In-Person",
        },
        capacity: { type: Number, required: true, min: 1 },
        filled: { type: Number, default: 0 },
        registrationDeadline: { type: Date },
        bannerImage: { type: String, default: "" },
        tags: [{ type: String }],
        approvalStatus: {
            type: String,
            enum: ["Pending Approval", "Approved", "Rejected"],
            default: "Pending Approval",
            index: true,
        },
        rejectionFeedback: { type: String, default: "" },
        featured: { type: Boolean, default: false },
        hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        registrations: [registrationSchema],
        comments: [commentSchema],
    },
    { timestamps: true }
);

eventSchema.statics.CATEGORIES = EVENT_CATEGORIES;

module.exports = mongoose.model("Event", eventSchema);
