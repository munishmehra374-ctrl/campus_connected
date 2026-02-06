const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// --- MODIFIED REGISTER LOGIC ---
exports.register = async (req, res) => {
    try {
        // Now capturing 'year' from req.body
        const { name, email, password, role, year } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Logic: If admin, year is null. If student, we use the year provided.
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "junior",
            year: role === "admin" ? null : year
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        // Returning year in the response so the frontend profile can show it
        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                year: user.year
            }
        });
    } catch (err) {
        console.log("REGISTER ERROR DETAILS:", err);
        res.status(500).json({ message: err.message });
    }
};

// --- LOGIN LOGIC ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                year: user.year
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- LOGOUT LOGIC --- 
exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};

// --- FIXED PROFILE LOGIC ---
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        console.log("Current User Role in DB:", user.role);
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};