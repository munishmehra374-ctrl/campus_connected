const Society = require('../models/Society');

// Get all societies for the hub
exports.getAllSocieties = async (req, res) => {
    try {
        const societies = await Society.find().populate('leadId', 'name');
        res.json(societies);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
};

// Get single society details
exports.getSocietyById = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id).populate('leadId', 'name email');
        if (!society) return res.status(404).json({ message: "Not Found" });
        res.json(society);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
};

exports.toggleJoin = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society) return res.status(404).json({ message: "Society not found" });

        const isMember = society.members.includes(req.user.id);

        if (isMember) {
            // Leave
            society.members = society.members.filter(id => id.toString() !== req.user.id);
        } else {
            // Join
            society.members.push(req.user.id);
        }

        await society.save();
        res.json({ message: isMember ? "Left society" : "Joined society", members: society.members });
    } catch (err) {
        res.status(500).json({ message: "Toggle join failed" });
    }
};

// Senior claims a society
exports.assignSenior = async (req, res) => {
    try {
        const existing = await Society.findOne({ leadId: req.user.id });
        if (existing) return res.status(400).json({ message: "You already lead a society" });

        const society = await Society.findById(req.params.id);
        if (society.leadId) return res.status(400).json({ message: "Already has a lead" });

        society.leadId = req.user.id;
        await society.save();
        res.json(society);
    } catch (err) { res.status(500).json({ message: "Assign failed" }); }
};

// Add workshop (Admin or Senior Lead)
exports.addWorkshop = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (req.user.role !== 'admin' && society.leadId?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        society.workshops.push(req.body);
        await society.save();
        res.status(201).json(society);
    } catch (err) { res.status(500).json({ message: "Failed to add" }); }
};

// Delete workshop (Admin or Senior Lead)
exports.deleteWorkshop = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (req.user.role !== 'admin' && society.leadId?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        society.workshops = society.workshops.filter(w => w._id.toString() !== req.params.wsId);
        await society.save();
        res.json(society);
    } catch (err) { res.status(500).json({ message: "Delete failed" }); }
};

// Admin Only: Create/Delete Society
exports.createSociety = async (req, res) => {
    try {
        const society = await Society.create(req.body);
        res.status(201).json(society);
    } catch (err) { res.status(400).json({ message: "Creation failed" }); }
};

exports.deleteSociety = async (req, res) => {
    try {
        await Society.findByIdAndDelete(req.params.id);
        res.json({ message: "Society Deleted" });
    } catch (err) { res.status(500).json({ message: "Delete failed" }); }
};