const express = require('express');
const router = express.Router();
const {
    askQuestion,
    approveQuestion,
    answerQuestion,
    getQuestions,
    resolveQuestion,
    deleteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');

// Get questions
router.get('/', getQuestions);

// Junior Actions
router.post('/', protect, askQuestion);
router.patch('/:id/resolve', protect, resolveQuestion);

// Senior Actions
router.post('/:id/answer', protect, answerQuestion);

// Admin Actions
router.patch('/:id/approve', protect, approveQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;