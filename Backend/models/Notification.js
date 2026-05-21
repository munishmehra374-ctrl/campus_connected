const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: [
                "public_answer",
                "mentorship_message",
                "question_solved",
                "thread_deleted",
                "question_approved",
            ],
            required: true,
        },
        title: { type: String, required: true },
        body: { type: String, default: "" },
        read: { type: Boolean, default: false },
        meta: {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
            threadId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorshipThread" },
            fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
