const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["junior", "senior", "admin"],
        default: "junior",
    },
    year: {
        type: Number,
        required: false,
    },
    appliedRole: {
        type: String,
        enum: ["none", "senior"],
        default: "none",
    },
    verificationStatus: {
        type: String,
        enum: ["none", "pending_verification", "approved", "rejected"],
        default: "none",
    },
    mentorVerified: {
        type: Boolean,
        default: false,
    },
    branch: { type: String, default: "" },
    admissionYear: { type: Number },
    collegeId: { type: String, default: "" },
    skills: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    github: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);
