const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The Senior
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // The Juniors
    workshops: [{
        title: String,
        body: String,
        date: String,
        time: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Society', societySchema);