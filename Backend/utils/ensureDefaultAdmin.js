const bcrypt = require("bcrypt");
const User = require("../models/User");

const DEFAULT_ADMIN = {
    email: "admin@campusconnected.com",
    name: "Campus Connected Admin",
    plainPassword: "admin@1234",
};

const LEGACY_ADMIN_EMAILS = ["admin@gmail.com"];

async function ensureDefaultAdmin() {
    for (const legacyEmail of LEGACY_ADMIN_EMAILS) {
        const removed = await User.deleteOne({ email: new RegExp(`^${legacyEmail}$`, "i") });
        if (removed.deletedCount > 0) {
            console.log(`Removed legacy admin: ${legacyEmail}`);
        }
    }

    const email = DEFAULT_ADMIN.email.toLowerCase();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let existing = await User.findOne({
        email: { $regex: new RegExp(`^${escaped}$`, "i") },
    });

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.plainPassword, 10);

    if (existing) {
        existing.email = email;
        existing.password = hashedPassword;
        existing.role = "admin";
        existing.name = DEFAULT_ADMIN.name;
        existing.mentorVerified = true;
        existing.verificationStatus = "none";
        existing.appliedRole = "none";
        await existing.save();
        console.log(`Default admin ready: ${email}`);
        return existing;
    }

    const admin = await User.create({
        name: DEFAULT_ADMIN.name,
        email,
        password: hashedPassword,
        role: "admin",
        mentorVerified: true,
        verificationStatus: "none",
        appliedRole: "none",
    });

    console.log(`Default admin created: ${email}`);
    return admin;
}

module.exports = { ensureDefaultAdmin, DEFAULT_ADMIN };
