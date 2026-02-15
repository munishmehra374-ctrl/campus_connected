const CareerDomain = require("../models/CareerDomain");
const fs = require("fs");
const path = require("path");

exports.getDomains = async (req, res) => {
    try {
        const domains = await CareerDomain.find().sort({ createdAt: -1 });
        res.status(200).json(domains);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getDomainById = async (req, res) => {
    try {
        const domain = await CareerDomain.findById(req.params.id);
        if (!domain) return res.status(404).json({ message: "Not found" });
        res.status(200).json(domain);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

exports.addResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, url } = req.body;
        let finalUrl = url;
        if (req.file) finalUrl = `/uploads/${req.file.filename}`;

        const newResource = {
            title,
            type: req.file ? 'material' : type,
            url: finalUrl,
            addedBy: req.user ? req.user.name : "Senior Member"
        };

        const updated = await CareerDomain.findByIdAndUpdate(
            id,
            { $push: { resources: newResource } },
            { new: true }
        );
        res.status(201).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error adding resource" });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const { id, resourceId } = req.params;
        const domain = await CareerDomain.findById(id);
        if (!domain) return res.status(404).json({ message: "Domain not found" });

        const resource = domain.resources.id(resourceId);

        if (resource && resource.type === 'material' && resource.url?.startsWith('/uploads/')) {
            const fileName = path.basename(resource.url);
            const filePath = path.join(process.cwd(), "uploads", fileName);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (err) { console.error(err); }
            }
        }

        await CareerDomain.findByIdAndUpdate(
            id,
            { $pull: { resources: { _id: resourceId } } },
            { new: true, runValidators: false }
        );

        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ADDED THIS: The missing function that was causing the crash
exports.addTip = async (req, res) => {
    try {
        const { text } = req.body;
        const domain = await CareerDomain.findById(req.params.id);
        if (!domain) return res.status(404).json({ message: "Not found" });

        domain.seniorTips.push({
            author: req.user ? req.user.name : "Senior Member",
            text: text,
            createdAt: new Date()
        });

        await domain.save();
        res.status(200).json(domain);
    } catch (err) {
        res.status(400).json({ message: "Error saving tip" });
    }
};

exports.createDomain = async (req, res) => {
    try {
        const newDomain = new CareerDomain(req.body);
        await newDomain.save();
        res.status(201).json(newDomain);
    } catch (err) {
        res.status(400).json({ message: "Validation failed" });
    }
};

exports.deleteDomain = async (req, res) => {
    try {
        await CareerDomain.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};