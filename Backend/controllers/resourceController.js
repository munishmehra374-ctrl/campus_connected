const fs = require("fs");
const path = require("path");
const Resource = require("../models/Resource");

const populateFields = { path: "uploadedBy", select: "name role" };

const autoApproved = (role) => role === "senior" || role === "admin";

const removeFileIfExists = (fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
    const filePath = path.join(__dirname, "..", fileUrl);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

exports.uploadResource = async (req, res) => {
    try {
        const { title, subject, type, sem } = req.body;
        if (!title || !subject || !type || !sem) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const role = req.user.role;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

        const resource = await Resource.create({
            title,
            subject,
            type,
            sem,
            fileUrl,
            uploadedBy: req.user._id,
            uploaderRole: role,
            status: autoApproved(role) ? "approved" : "pending",
        });

        const populated = await Resource.findById(resource._id).populate(populateFields);
        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Upload failed." });
    }
};

exports.getResources = async (req, res) => {
    try {
        const role = req.user.role;
        let query = {};

        if (role === "junior") {
            query = {
                status: { $ne: "rejected" },
                $or: [
                    { status: "approved" },
                    { uploadedBy: req.user._id },
                ],
            };
        } else {
            query = { status: { $ne: "rejected" } };
        }

        const resources = await Resource.find(query)
            .populate(populateFields)
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPendingResources = async (req, res) => {
    try {
        const pending = await Resource.find({ status: "pending" })
            .populate(populateFields)
            .sort({ createdAt: -1 });

        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found." });
        }

        resource.status = "approved";
        await resource.save();

        const populated = await Resource.findById(resource._id).populate(populateFields);
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found." });
        }

        resource.status = "rejected";
        await resource.save();

        const populated = await Resource.findById(resource._id).populate(populateFields);
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found." });
        }

        const isOwner =
            resource.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "Not authorized to delete this resource." });
        }

        removeFileIfExists(resource.fileUrl);
        await Resource.findByIdAndDelete(req.params.id);

        res.json({ message: "Resource deleted successfully.", id: req.params.id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.trackDownload = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found." });
        }

        if (resource.status !== "approved" && req.user.role === "junior") {
            return res.status(403).json({ message: "Resource not available for download." });
        }

        resource.downloadCount += 1;
        await resource.save();

        res.json({ downloadCount: resource.downloadCount, fileUrl: resource.fileUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
