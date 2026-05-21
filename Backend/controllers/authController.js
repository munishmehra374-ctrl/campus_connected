const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { serializeUserForClient } = require("../utils/userSerialization");

function setAuthCookie(res, userId) {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
}

exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            year,
            accountType,
            branch,
            admissionYear,
            currentYear,
            collegeId,
            skills,
            linkedIn,
            github,
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const isSeniorApplicant = accountType === "senior_applicant" || role === "senior_applicant";

        if (isSeniorApplicant) {
            const studyYear = Number(currentYear ?? year);
            if (!studyYear || studyYear < 3 || studyYear > 4) {
                return res.status(400).json({
                    message: "Only 3rd and 4th year students are eligible for mentor access.",
                });
            }

            if (!collegeId?.trim() || !branch?.trim() || !admissionYear || !skills?.trim()) {
                return res.status(400).json({
                    message: "College ID, admission year, branch, and skills are required for mentor applications.",
                });
            }

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: "junior",
                appliedRole: "senior",
                verificationStatus: "pending_verification",
                mentorVerified: false,
                year: studyYear,
                branch: branch.trim(),
                admissionYear: Number(admissionYear),
                collegeId: collegeId.trim(),
                skills: skills.trim(),
                linkedIn: linkedIn?.trim() || "",
                github: github?.trim() || "",
            });

            setAuthCookie(res, user._id);

            return res.status(201).json({
                message:
                    "Your mentor application is under review. You currently have junior access until verification is completed.",
                user: serializeUserForClient(user, user.role),
            });
        }

        const backendRole = role === "admin" ? "admin" : "junior";
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: backendRole,
            year: backendRole === "admin" ? null : Number(year) || 1,
            verificationStatus: "none",
            appliedRole: "none",
            mentorVerified: backendRole === "admin",
        });

        setAuthCookie(res, user._id);

        res.status(201).json({
            message: "User registered successfully",
            user: serializeUserForClient(user, user.role),
        });
    } catch (err) {
        console.log("REGISTER ERROR DETAILS:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        setAuthCookie(res, user._id);

        let message = "Login successful";
        if (user.verificationStatus === "pending_verification") {
            message =
                "Your mentor application is under review. You currently have junior access until verification is completed.";
        }

        res.json({
            message,
            user: serializeUserForClient(user, user.role),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ user: serializeUserForClient(user, user.role) });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
