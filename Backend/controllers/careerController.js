const fs = require("fs");
const path = require("path");
const CareerDomain = require("../models/CareerDomain");

// 1. GET ALL PATHWAYS
exports.getDomains = async (req, res) => {
    try {
        const domains = await CareerDomain.find().sort({ createdAt: -1 });
        res.status(200).json(domains);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching domains" });
    }
};

// 2. GET SINGLE DOMAIN
exports.getDomainById = async (req, res) => {
    try {
        const domain = await CareerDomain.findById(req.params.id);
        if (!domain) return res.status(404).json({ message: "Domain not found" });
        res.status(200).json(domain);
    } catch (err) {
        res.status(500).json({ message: "Error fetching domain details" });
    }
};

// 3. ADD RESOURCE (Handles YouTube vs PDF)
exports.addResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, url } = req.body;

        let finalUrl = url;
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
        }

        const newResource = {
            title,
            type: req.file ? 'material' : type,
            url: finalUrl,
            addedBy: req.user ? req.user.name : "Senior Member",
            createdAt: new Date()
        };

        const updatedDomain = await CareerDomain.findByIdAndUpdate(
            id,
            { $push: { resources: newResource } },
            { new: true }
        );

        if (!updatedDomain) return res.status(404).json({ message: "Not found" });
        res.status(201).json(updatedDomain);
    } catch (error) {
        res.status(500).json({ message: "Server error adding resource" });
    }
};

// 4. ADD A SENIOR TIP
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

// 5. CREATE DOMAIN (Admin Only)
exports.createDomain = async (req, res) => {
    try {
        const newDomain = new CareerDomain(req.body);
        await newDomain.save();
        res.status(201).json(newDomain);
    } catch (err) {
        res.status(400).json({ message: "Validation failed." });
    }
};

// 6. DELETE A SINGLE RESOURCE FROM A PATHWAY
exports.deleteResource = async (req, res) => {
    try {
        const { id, resourceId } = req.params;

        const domain = await CareerDomain.findById(id);
        if (!domain) {
            return res.status(404).json({ message: "Domain not found" });
        }

        const resource = domain.resources.id(resourceId);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        if (resource.url && resource.url.startsWith("/uploads/")) {
            const filePath = path.join(__dirname, "..", resource.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        domain.resources.pull(resourceId);
        await domain.save();

        res.status(200).json({
            message: "Resource deleted successfully",
            domain,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete resource" });
    }
};

// 7. DELETE DOMAIN
exports.deleteDomain = async (req, res) => {
    try {
        const deleted = await CareerDomain.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Domain not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};