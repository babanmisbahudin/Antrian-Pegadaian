const mongoose = require("mongoose");

const queueCounterSchema = new mongoose.Schema({
  lastKasir: { type: Number, default: 0 },
  lastPenaksir: { type: Number, default: 0 },
});

module.exports =
  mongoose.models.QueueCounter ||
  mongoose.model("QueueCounter", queueCounterSchema);
