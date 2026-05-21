function isLegacyVerifiedSenior(user) {
    return (
        user.role === "senior" &&
        (!user.verificationStatus || user.verificationStatus === "none")
    );
}

exports.isVerifiedSenior = function isVerifiedSenior(user) {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role !== "senior") return false;
    if (isLegacyVerifiedSenior(user)) return true;
    return user.verificationStatus === "approved" && user.mentorVerified === true;
};

exports.serializeUserForClient = function serializeUserForClient(user, viewerRole) {
    const doc = user.toObject ? user.toObject() : { ...user };
    const legacySenior = isLegacyVerifiedSenior(doc);

    const payload = {
        _id: doc._id,
        name: doc.name,
        email: doc.email,
        role: doc.role,
        year: doc.year,
        branch: doc.branch || "",
        admissionYear: doc.admissionYear,
        appliedRole: doc.appliedRole || "none",
        verificationStatus: doc.verificationStatus || "none",
        mentorVerified: legacySenior ? true : Boolean(doc.mentorVerified),
        isSeniorApplicant:
            doc.appliedRole === "senior" && doc.verificationStatus === "pending_verification",
        skills: doc.skills ? String(doc.skills).split(",").map((s) => s.trim()).filter(Boolean) : [],
    };

    if (viewerRole === "admin") {
        payload.collegeId = doc.collegeId || "";
        payload.linkedIn = doc.linkedIn || "";
        payload.github = doc.github || "";
        payload.skillsRaw = doc.skills || "";
        payload.rejectionReason = doc.rejectionReason || "";
        payload.verificationSubmittedAt = doc.updatedAt || doc.createdAt;
    }

    return payload;
};
