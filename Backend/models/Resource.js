const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    sem: { type: String, required: true },

    fileUrl: String,

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ["pending", "approved"],
        default: "pending"
    }
});

module.exports = mongoose.model("Resource", resourceSchema);
