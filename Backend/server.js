const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs"); // Added for folder management

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const eventRoutes = require("./routes/eventRoutes");
const societyRoutes = require('./routes/societyRoutes');
const questionRoutes = require('./routes/questionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const careerRoutes = require('./routes/careerRoutes');
const seniorVerificationRoutes = require('./routes/seniorVerificationRoutes');


dotenv.config();
connectDB();

const app = express();

/* Render / reverse proxies — required for secure cookies in production */
app.set("trust proxy", 1);

const corsOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://campus-connected-nine.vercel.app",
];

if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(",").forEach((url) => {
        const trimmed = url.trim();
        if (trimmed) corsOrigins.push(trimmed);
    });
}

if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(",").forEach((url) => {
        const trimmed = url.trim();
        if (trimmed) corsOrigins.push(trimmed);
    });
}

const allowedOrigins = [...new Set(corsOrigins)];

// --- FOLDER INITIALIZATION ---
// This ensures the 'uploads' folder exists so Multer doesn't throw an error
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Created 'uploads' directory for materials storage.");
}

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin || allowedOrigins[0]);
            } else {
                callback(new Error(`CORS blocked for origin: ${origin}`));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// Serve the uploads folder statically so Juniors can click and view the PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/questions', questionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/senior-verification", seniorVerificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});