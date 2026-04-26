const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nik: { type: String, required: true, unique: true },
  cabang: { type: String, default: "" },
  outlet: { type: String, default: "" },
  loket: { type: String, default: "-" },
  role: {
    type: String,
    required: true,
    enum: ["admin", "kasir", "penaksir", "satpam"],
    default: "kasir",
  },
  password: { type: String, required: true },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
