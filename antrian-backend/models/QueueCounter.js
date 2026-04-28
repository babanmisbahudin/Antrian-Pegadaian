const mongoose = require("mongoose");

const queueCounterSchema = new mongoose.Schema({
  lastKasir: { type: Number, default: 0 },
  lastPenaksir: { type: Number, default: 0 },
  lastKasirAntrian: { type: Number, default: 0 },
  lastPenaksirAntrian: { type: Number, default: 0 },
  resetDate: { type: String, default: "" },
});

module.exports =
  mongoose.models.QueueCounter ||
  mongoose.model("QueueCounter", queueCounterSchema);
