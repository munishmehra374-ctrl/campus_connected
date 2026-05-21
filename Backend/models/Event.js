const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    type: { type: String, enum: ["Workshop", "Hackathon", "Talk", "Competition"], required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    filled: { type: Number, default: 0 },
    capacity: { type: Number, required: true }
});
module.exports = mongoose.model('Event', eventSchema);
