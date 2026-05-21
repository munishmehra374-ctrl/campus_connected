require("dotenv").config();
const mongoose = require("mongoose");
const { ensureDefaultAdmin } = require("../utils/ensureDefaultAdmin");

async function main() {
    if (!process.env.MONGO_URL) {
        console.error("MONGO_URL is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const admin = await ensureDefaultAdmin();
    console.log("Admin provisioned (bcrypt hash only):", admin.email);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});
