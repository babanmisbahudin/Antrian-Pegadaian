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
  status: {
    type: String,
    enum: ["waiting", "called", "done"],
    default: "waiting",
  },
  dipanggilOleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  waktu: {
    type: Date,
    default: Date.now,
  },
});
