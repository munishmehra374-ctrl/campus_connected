const express = require("express");
const router = express.Router();
const {
    uploadResource,
    getResources,
    approveResource,
    deleteResource
} = require("../controllers/resourceController");

const { protect, isSenior } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", protect, getResources);
router.post("/", protect, isSenior, upload.single("file"), uploadResource);

// Admin Routes
router.put("/:id/approve", protect, isAdmin, approveResource);
router.delete("/:id", protect, isAdmin, deleteResource); // Strictly Admin

module.exports = router;