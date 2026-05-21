const Resource = require("../models/Resource");

exports.uploadResource = async (req, res) => {
    try {
        const { title, subject, type, sem } = req.body;

        const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

        const resource = await Resource.create({
            title,
            subject,
            type,
            sem,
            fileUrl,
            uploadedBy: req.user._id,
            status: "pending"
        });

        res.json(resource);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getResources = async (req, res) => {
    try {
        let resources;

        if (req.user.role === "junior") {
            resources = await Resource.find({ status: "approved" });
        } else {
            resources = await Resource.find();
        }

        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { new: true }
        );

        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
