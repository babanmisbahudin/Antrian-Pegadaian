require("dotenv").config(); // WAJIB paling atas

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const queueRoutes = require("./routes/queueRoutes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/antrian", require("./routes/antrianRoutes"));
app.use("/uploads", express.static("uploads")); // untuk akses file video statis
app.use("/api/video", require("./routes/videoRoutes"));
app.use("/api/harga-emas", require("./routes/hargaEmasRoutes"));
app.use("/api/queue", queueRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
