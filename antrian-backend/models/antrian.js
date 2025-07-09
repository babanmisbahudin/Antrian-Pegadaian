const mongoose = require("mongoose");

const antrianSchema = new mongoose.Schema({
  nomor: String,
  tujuan: String, // contoh: "kasir"
  loket: Number,
  status: {
    type: String,
    enum: ["menunggu", "dipanggil", "selesai", "batal"],
    default: "menunggu",
  },
  waktu: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Antrian", antrianSchema);
