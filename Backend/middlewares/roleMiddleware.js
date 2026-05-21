// middlewares/roleMiddleware.js
const { isVerifiedSenior } = require("../utils/userSerialization");

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Access denied: Admin rights required." });
    }
};

// If you need the general authorize function for Events too:
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You do not have the required role." });
        }
        if (roles.includes("senior") && req.user.role === "senior" && !isVerifiedSenior(req.user)) {
            return res.status(403).json({
                message: "Mentor verification required before using senior privileges.",
            });
        }
        next();
    };
};