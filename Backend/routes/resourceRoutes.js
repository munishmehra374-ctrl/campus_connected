const express = require("express");
const router = express.Router();

const {
    uploadResource,
    getResources,
    getPendingResources,
    approveResource,
    rejectResource,
    deleteResource,
    trackDownload,
} = require("../controllers/resourceController");

const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", protect, getResources);
router.get("/pending", protect, isAdmin, getPendingResources);

router.post("/", protect, upload.single("file"), uploadResource);

router.put("/:id/approve", protect, isAdmin, approveResource);
router.put("/:id/reject", protect, isAdmin, rejectResource);
router.delete("/:id", protect, deleteResource);
router.post("/:id/download", protect, trackDownload);

module.exports = router;
