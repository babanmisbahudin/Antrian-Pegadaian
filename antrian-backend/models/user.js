const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nama: String,
  nik: String,
  cabang: String,
  outlet: String,
  loket: String,
  role: String,
  password: String,
});

// ✅ Cek dulu, kalau model "User" sudah ada, pakai itu
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
