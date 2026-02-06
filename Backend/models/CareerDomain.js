const mongoose = require("mongoose");

const CareerDomainSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    demand: { type: String, default: "High" },
    duration: { type: String },
    color: { type: String, default: "#8b5cf6" },
    skills: [String],
    roadmap: [String],

    // Short advice shown on the card grid
    seniorTips: [{
        author: String,
        text: String,
        date: { type: Date, default: Date.now }
    }],

    // The Library: Stores YouTube URLs OR local Multer file paths
    resources: [{
        title: { type: String, required: true },
        url: { type: String, required: true }, // Stores YouTube Link OR '/uploads/filename.pdf'
        type: {
            type: String,
            enum: ['video', 'material'],
            required: true
        },
        addedBy: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("CareerDomain", CareerDomainSchema);