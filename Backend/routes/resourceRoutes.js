const express = require("express");
const router = express.Router();

const {
    uploadResource,
    getResources,
    approveResource
} = require("../controllers/resourceController");

const { protect, isSenior } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", protect, getResources);

router.post(
    "/",
    protect,
    isSenior,
    upload.single("file"),
    uploadResource
);

router.put("/:id/approve", protect, isAdmin, approveResource);

module.exports = router;
