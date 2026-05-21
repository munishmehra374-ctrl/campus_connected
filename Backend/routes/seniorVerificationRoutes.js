const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const seniorVerificationController = require("../controllers/seniorVerificationController");

router.get(
    "/pending",
    protect,
    authorize("admin"),
    seniorVerificationController.listPendingApplications
);
router.patch(
    "/:id/approve",
    protect,
    authorize("admin"),
    seniorVerificationController.approveApplication
);
router.patch(
    "/:id/reject",
    protect,
    authorize("admin"),
    seniorVerificationController.rejectApplication
);

module.exports = router;
