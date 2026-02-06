const Question = require('../models/Question');

// JUNIOR: Ask Question
exports.askQuestion = async (req, res) => {
    try {
        const question = new Question({
            ...req.body,
            author: { id: req.user._id, name: req.user.name, role: req.user.role }
        });
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ message: "Error saving question" });
    }
};

// ADMIN: Approve Question
exports.approveQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { status: 'Unsolved' },
            { new: true }
        );
        res.json(question);
    } catch (err) {
        res.status(500).json({ message: "Approval failed" });
    }
};

// SENIOR: Answer Question
exports.answerQuestion = async (req, res) => {
    try {
        const { content } = req.body;
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });

        question.answers.push({
            seniorId: req.user._id,
            seniorName: req.user.name,
            content
        });
        await question.save();
        res.json(question);
    } catch (err) {
        res.status(500).json({ message: "Error posting answer" });
    }
};

// JUNIOR: Mark as Solved
exports.resolveQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ message: "Question not found" });

        // IMPORTANT: Convert both to strings to compare correctly
        const isAuthor = question.author.id.toString() === req.user._id.toString();

        if (!isAuthor) {
            return res.status(403).json({ message: "Only the author can mark this as solved" });
        }

        question.status = 'Solved';
        await question.save();
        res.json(question);
    } catch (err) {
        res.status(500).json({ message: "Server error during resolve" });
    }
};

// ADMIN: Delete Question
exports.deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: "Question deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

// PUBLIC: Get All (Admins see all, others see Approved/Solved)
exports.getQuestions = async (req, res) => {
    try {
        let query = { status: { $ne: 'Pending' } };

        // If user is admin, they should be able to see Pending questions too
        // Note: This logic depends on if you want one generic route or two.
        // For now, we fetch all for the frontend to filter.
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: "Error fetching questions" });
    }
};

