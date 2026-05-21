const mongoose = require("mongoose");

const publicAnswerSchema = new mongoose.Schema({
    seniorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seniorName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const solvedMetaSchema = new mongoose.Schema(
    {
        solvedAt: { type: Date, default: null },
        solvedByJuniorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        helpedBySeniorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        helpedBySeniorName: { type: String, default: null },
    },
    { _id: false }
);

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    votes: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["Pending", "Unsolved", "Solved"],
        default: "Unsolved",
    },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        role: String,
    },
    publicAnswers: { type: [publicAnswerSchema], default: [] },
    solvedMeta: { type: solvedMetaSchema, default: () => ({}) },
    hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    /** Legacy — migrated to publicAnswers on read */
    answers: [
        {
            seniorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            seniorName: String,
            content: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
    /** Legacy embedded threads — migrated to MentorshipThread collection */
    threads: [{ type: mongoose.Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Question", questionSchema);
