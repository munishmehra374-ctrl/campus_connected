const mongoose = require("mongoose");
const { ensureDefaultAdmin } = require("../utils/ensureDefaultAdmin");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");

        if (process.env.ENSURE_DEFAULT_ADMIN !== "false") {
            await ensureDefaultAdmin();
        }
    } catch (error) {
        console.log("DB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
