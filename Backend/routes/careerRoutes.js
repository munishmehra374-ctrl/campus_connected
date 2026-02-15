const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { auth } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

console.log("Controller methods found:", Object.keys(careerController));

// --- Public / Authenticated Routes ---
router.get("/", auth, careerController.getDomains);
router.get("/:id", auth, careerController.getDomainById);

// --- Senior & Admin Routes ---
router.post(
    "/:id/resource",
    auth,
    authorize("senior", "admin"),
    upload.single("file"),
    careerController.addResource
);

router.post("/:id/tip", auth, authorize("senior", "admin"), careerController.addTip);

// NEW: Delete specific resource
router.delete(
    "/:id/resource/:resourceId",
    auth,
    authorize("senior", "admin"),
    careerController.deleteResource
);

// --- Admin Only Routes ---
router.post("/", auth, authorize("admin"), careerController.createDomain);
router.delete("/:id", auth, authorize("admin"), careerController.deleteDomain);

module.exports = router;