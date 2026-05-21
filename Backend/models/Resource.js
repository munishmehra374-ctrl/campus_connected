const mongoose = require("mongoose");

const RESOURCE_TYPES = [
    "Notes",
    "PYQ",
    "Assignment",
    "Lab Manual",
    "Cheat Sheet",
    "Interview Prep",
    "Study Material",
];

const resourceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        subject: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: RESOURCE_TYPES,
        },
        sem: { type: String, required: true },
        fileUrl: { type: String, default: "" },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        uploaderRole: {
            type: String,
            enum: ["junior", "senior", "admin"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        downloadCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
module.exports.RESOURCE_TYPES = RESOURCE_TYPES;
