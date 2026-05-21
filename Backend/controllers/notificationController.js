const Notification = require("../models/Notification");

exports.listNotifications = async (req, res) => {
    try {
        const items = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json(items);
    } catch (e) {
        res.status(500).json({ message: "Failed to load notifications" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const n = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!n) return res.status(404).json({ message: "Not found" });
        res.json(n);
    } catch (e) {
        res.status(500).json({ message: "Failed to update" });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ message: "Failed" });
    }
};

exports.unreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, read: false });
        res.json({ count });
    } catch (e) {
        res.status(500).json({ message: "Failed" });
    }
};
