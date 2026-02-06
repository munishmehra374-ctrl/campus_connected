const Event = require("../models/Event");

// Load events + Filter by type + Sort by date
exports.getEvents = async (req, res) => {
    try {
        const { type } = req.query;
        const query = (type && type !== "All") ? { type } : {};

        // Sorting: Nearest date first (Ascending)
        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Error loading events" });
    }
};

// Senior creates event
exports.createEvent = async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: "Creation failed - check fields" });
    }
};

// Junior enrolls (Increases filled count)
exports.rsvpEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.filled >= event.capacity) {
            return res.status(400).json({ message: "Event is full" });
        }

        event.filled += 1;
        await event.save();
        res.json({ success: true, filled: event.filled });
    } catch (err) {
        res.status(500).json({ message: "RSVP failed" });
    }
};

// Admin deletes
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event deleted by Admin" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};
// If the controller says: exports.approveResource
// Your route MUST say:
