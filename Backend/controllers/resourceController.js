const Resource = require("../models/Resource");
const fs = require("fs");
const path = require("path");

exports.uploadResource = async (req, res) => {
    try {
        const { title, subject, type, sem } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
        const resource = await Resource.create({
            title, subject, type, sem, fileUrl,
            uploadedBy: req.user._id,
            status: "pending"
        });
        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getResources = async (req, res) => {
    try {
        let resources = (req.user.role === "junior")
            ? await Resource.find({ status: "approved" })
            : await Resource.find();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id, { status: "approved" }, { new: true }
        );
        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- NEW DELETE LOGIC ---
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Not found" });

        // Remove file from storage
        if (resource.fileUrl) {
            const absolutePath = path.join(__dirname, "..", resource.fileUrl);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};