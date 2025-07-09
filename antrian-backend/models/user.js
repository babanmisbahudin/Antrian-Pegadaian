const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nik: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  cabang: { type: String },
  outlet: { type: String },
});

module.exports = mongoose.model("User", userSchema);
