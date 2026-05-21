const User = require("../models/User");
const { serializeUserForClient } = require("../utils/userSerialization");

exports.listPendingApplications = async (req, res) => {
    try {
        const applicants = await User.find({
            verificationStatus: "pending_verification",
            appliedRole: "senior",
        }).sort({ createdAt: -1 });

        res.json(
            applicants.map((u) => serializeUserForClient(u, "admin"))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Could not load applications" });
    }
};

exports.approveApplication = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Application not found" });

        if (user.verificationStatus !== "pending_verification") {
            return res.status(400).json({ message: "Application is not pending review" });
        }

        user.role = "senior";
        user.verificationStatus = "approved";
        user.mentorVerified = true;
        user.rejectionReason = "";
        await user.save();

        res.json({
            message: "Mentor application approved. Senior privileges unlocked.",
            user: serializeUserForClient(user, "admin"),
        });
    } catch (err) {
        res.status(500).json({ message: "Approval failed" });
    }
};

exports.rejectApplication = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Application not found" });

        if (user.verificationStatus !== "pending_verification") {
            return res.status(400).json({ message: "Application is not pending review" });
        }

        user.role = "junior";
        user.verificationStatus = "rejected";
        user.mentorVerified = false;
        user.appliedRole = "none";
        user.rejectionReason = reason || "Application did not meet verification requirements.";
        await user.save();

        res.json({
            message: "Mentor application rejected.",
            user: serializeUserForClient(user, "admin"),
        });
    } catch (err) {
        res.status(500).json({ message: "Rejection failed" });
    }
};
