const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

router.get("/hub-summary", protect, eventController.getHubSummary);
router.get("/organizer/dashboard", protect, authorize("senior", "admin"), eventController.getOrganizerDashboard);
router.get("/", protect, eventController.getEvents);
router.get("/:id", protect, eventController.getEventById);

router.post("/", protect, authorize("senior", "admin"), eventController.createEvent);
router.post("/:id/register", protect, authorize("junior"), eventController.registerForEvent);
router.post("/:id/rsvp", protect, authorize("junior"), eventController.rsvpEvent);
router.post("/:id/bookmark", protect, eventController.toggleBookmark);
router.post("/:id/comments", protect, eventController.addComment);

router.patch("/:id/hide", protect, eventController.hideEvent);
router.patch("/:id/approve", protect, authorize("admin"), eventController.approveEvent);
router.patch("/:id/reject", protect, authorize("admin"), eventController.rejectEvent);
router.patch(
    "/:id/registrations/:regId",
    protect,
    authorize("senior", "admin"),
    eventController.updateEventRegistration
);

router.delete("/:id", protect, authorize("admin"), eventController.deleteEvent);

module.exports = router;
