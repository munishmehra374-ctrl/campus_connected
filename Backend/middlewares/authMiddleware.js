const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isVerifiedSenior } = require("../utils/userSerialization");

// 1. Protect Route (Verifies Token)
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not logged in" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) return res.status(401).json({ message: "User not found" });
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// 2. Authorize Roles (The one your societyRoutes uses)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "Access denied." });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied: ${req.user.role} role not permitted.`,
            });
        }

        if (roles.includes("senior") && req.user.role === "senior" && !isVerifiedSenior(req.user)) {
            return res.status(403).json({
                message: "Mentor verification required before using senior privileges.",
            });
        }

        next();
    };
};

// 3. Helper for Seniors (Optional)
const isSenior = (req, res, next) => {
    if (req.user.role !== "senior" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only senior/admin allowed" });
    }
    next();
};

module.exports = {
    protect,
    auth:protect,
     authorize,
    isSenior };