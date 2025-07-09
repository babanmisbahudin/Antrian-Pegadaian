const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/antrian", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB terkoneksi");
  } catch (err) {
    console.error("❌ MongoDB gagal konek:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
