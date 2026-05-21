const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, enum: ["junior", "senior", "admin"], required: true },
        content: { type: String, default: "" },
        deletedAt: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const mentorshipThreadSchema = new mongoose.Schema(
    {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },
        juniorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        seniorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        seniorName: { type: String, required: true },
        /** Subdocument _id of Question.publicAnswers this thread branched from */
        linkedPublicAnswerId: { type: mongoose.Schema.Types.ObjectId, default: null },
        messages: [messageSchema],
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
        lastActivityAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

mentorshipThreadSchema.index({ questionId: 1, seniorId: 1, juniorId: 1 });

module.exports = mongoose.model("MentorshipThread", mentorshipThreadSchema);
