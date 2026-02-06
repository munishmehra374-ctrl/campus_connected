const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    votes: { type: Number, default: 0 },
    // status: Pending (Waiting for Admin), Unsolved (Approved), Solved (Junior finished)
    status: {
        type: String,
        enum: ['Pending', 'Unsolved', 'Solved'],
        default: 'Pending'
    },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        role: String
    },
    answers: [{
        seniorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seniorName: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);