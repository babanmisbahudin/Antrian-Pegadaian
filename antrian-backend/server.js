require("dotenv").config();

const requiredEnvVars = ["JWT_SECRET", "MONGO_URI"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

// Pastikan folder uploads ada
fs.mkdirSync(path.join(__dirname, "uploads", "video"), { recursive: true });

const userRoutes = require("./routes/userRoutes");
const antrianRoutes = require("./routes/antrianRoutes");
const videoRoutes = require("./routes/videoRoutes");
const hargaEmasRoutes = require("./routes/hargaEmasRoutes");
const queueRoutes = require("./routes/queueRoutes");

const app = express();

connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/antrian", antrianRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/harga-emas", hargaEmasRoutes);
app.use("/api/queue", queueRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
