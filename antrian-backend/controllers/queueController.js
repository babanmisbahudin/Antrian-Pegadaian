const QueueCounter = require("../models/QueueCounter");
const Queue = require("../models/queue");

// POST /api/queue/call
exports.callQueue = async (req, res) => {
  const { role, loket } = req.body;

  if (!role || !["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    await initQueueIfNotExists();

    const counter = await QueueCounter.findOne();

    // Update nomor sesuai role
    if (role === "kasir") {
      counter.lastKasir += 1;
    } else if (role === "penaksir") {
      counter.lastPenaksir += 1;
    }

    await counter.save();

    // Nomor antrian: format A001, A002, ...
    const nomor =
      role === "kasir"
        ? `A${counter.lastKasir.toString().padStart(3, "0")}`
        : `P${counter.lastPenaksir.toString().padStart(3, "0")}`;

    // Simpan ke log antrian
    const newQueue = await Queue.create({
      role,
      nomor,
      loket,
    });

    res.json({ message: "Antrian dipanggil", data: newQueue });
  } catch (err) {
    console.error("❌ Error callQueue:", err);
    res.status(500).json({ message: "Gagal memanggil antrian" });
  }
};

// GET /api/queue/terakhir
exports.getLastCalled = async (req, res) => {
  try {
    const latest = await Queue.find().sort({ waktu: -1 }).limit(1);
    res.json(latest[0] || null);
  } catch (err) {
    console.error("❌ Error getLastCalled:", err);
    res.status(500).json({ message: "Gagal ambil antrian terakhir" });
  }
};

const initQueueIfNotExists = async () => {
  const existing = await QueueCounter.findOne();
  if (!existing) {
    await QueueCounter.create({ lastKasir: 0, lastPenaksir: 0 });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    await initQueueIfNotExists();
    const queue = await QueueCounter.findOne().select("-__v");
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data antrian" });
  }
};

exports.resetQueue = async (req, res) => {
  try {
    await initQueueIfNotExists();
    const queue = await QueueCounter.findOne();
    queue.lastKasir = 0;
    queue.lastPenaksir = 0;
    await queue.save();

    res.json({ message: "Antrian berhasil direset", queue });
  } catch (err) {
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};
