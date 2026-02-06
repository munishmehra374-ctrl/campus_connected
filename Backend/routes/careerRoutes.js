const express = require("express");
const router = express.Router();

// Import the Controller
const careerController = require("../controllers/careerController");

// Import Middlewares
const { auth } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// NEW: Import the Multer middleware you created
const upload = require("../middlewares/uploadMiddleware");

// --- Routes ---

// 1. All Authenticated Users: Get all pathways for the main grid
router.get("/", auth, careerController.getDomains);

// 2. All Authenticated Users: Get details for ONE specific pathway (for the Deep-Dive Page)
router.get("/:id", auth, careerController.getDomainById);

/**
 * 3. UPDATED: Seniors & Admins Only
 * Added 'upload.single("file")' to handle the PDF upload.
 * "file" must be the name attribute used in your Frontend FormData.
 */
router.post(
    "/:id/resource",
    auth,
    authorize("senior", "admin"),
    upload.single("file"),
    careerController.addResource
);

// 4. Seniors & Admins: Can post quick career advice/tips for the card preview
router.post("/:id/tip", auth, authorize("senior", "admin"), careerController.addTip);

// 5. Admins Only: Create a new pathway "box"
router.post("/", auth, authorize("admin"), careerController.createDomain);

// 6. Admins Only: Delete an entire pathway
router.delete("/:id", auth, authorize("admin"), careerController.deleteDomain);

module.exports = router;