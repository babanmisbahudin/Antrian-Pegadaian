const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["kasir", "penaksir"],
    required: true,
  },
  nomor: {
    type: Number,
    required: true,
  },
  loket: {
    type: String,
    required: true,
  },
  waktu: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Queue || mongoose.model("Queue", queueSchema);
