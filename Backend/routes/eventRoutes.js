const express = require("express");
const router = express.Router();

// 1. Check if this file exists in C:\Users\qcc\OneDrive\Documents\Backend_Main\controllers\
const eventController = require("../controllers/eventController");

// 2. Using "middlewares" (plural) to match your folder name
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

router.get("/", protect, eventController.getEvents);
router.post("/", protect, authorize("senior"), eventController.createEvent);
router.post("/:id/rsvp", protect, authorize("junior"), eventController.rsvpEvent);
router.delete("/:id", protect, authorize("admin"), eventController.deleteEvent);

module.exports = router;