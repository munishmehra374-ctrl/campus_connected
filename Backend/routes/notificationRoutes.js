const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, ctrl.listNotifications);
router.get("/unread-count", protect, ctrl.unreadCount);
router.patch("/:id/read", protect, ctrl.markRead);
router.patch("/read-all", protect, ctrl.markAllRead);

module.exports = router;
