const express = require("express");
const router = express.Router();
const {
    askQuestion,
    approveQuestion,
    addPublicAnswer,
    openPrivateThread,
    addThreadMessage,
    deleteThread,
    deleteThreadMessage,
    getQuestionById,
    getQuestions,
    deleteQuestion,
    markSolved,
    reopenQuestion,
    hideQuestion,
    answerQuestion,
    createThread,
} = require("../controllers/questionController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, getQuestions);
router.get("/:id", protect, getQuestionById);

router.post("/", protect, askQuestion);

router.post("/:id/public-answers", protect, addPublicAnswer);
router.post("/:id/private-threads", protect, openPrivateThread);
router.post("/:id/threads/:threadId/messages", protect, addThreadMessage);
router.delete("/:id/threads/:threadId", protect, deleteThread);
router.delete("/:id/threads/:threadId/messages/:messageId", protect, deleteThreadMessage);

router.patch("/:id/approve", protect, approveQuestion);
router.patch("/:id/mark-solved", protect, markSolved);
router.patch("/:id/reopen", protect, reopenQuestion);
router.patch("/:id/hide", protect, hideQuestion);
router.delete("/:id", protect, deleteQuestion);

/** Deprecated client paths — map to new behavior */
router.post("/:id/answer", protect, answerQuestion);
router.post("/:id/threads", protect, createThread);

module.exports = router;
