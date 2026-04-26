const QueueCounter = require("../models/QueueCounter");
const Queue = require("../models/queue");

exports.callQueue = async (req, res) => {
  const { role, loket } = req.body;

  if (!role || !["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  if (!loket) {
    return res.status(400).json({ message: "Loket wajib diisi" });
  }

  try {
    const counterField = role === "kasir" ? "lastKasir" : "lastPenaksir";

    // Atomic increment - tidak ada race condition
    const counter = await QueueCounter.findOneAndUpdate(
      {},
      { $inc: { [counterField]: 1 } },
      { new: true, upsert: true }
    );

    const nomor =
      role === "kasir"
        ? `A${counter[counterField].toString().padStart(3, "0")}`
        : `P${counter[counterField].toString().padStart(3, "0")}`;

    const newQueue = await Queue.create({ role, nomor, loket });

    res.json({ message: "Antrian dipanggil", data: newQueue });
  } catch (err) {
    console.error("❌ Error callQueue:", err);
    res.status(500).json({ message: "Gagal memanggil antrian" });
  }
};

exports.getLastCalled = async (req, res) => {
  try {
    const [lastKasir, lastPenaksir] = await Promise.all([
      Queue.findOne({ role: "kasir" }).sort({ waktu: -1 }),
      Queue.findOne({ role: "penaksir" }).sort({ waktu: -1 }),
    ]);
    res.json({ kasir: lastKasir || null, penaksir: lastPenaksir || null });
  } catch (err) {
    console.error("❌ Error getLastCalled:", err);
    res.status(500).json({ message: "Gagal ambil antrian terakhir" });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    let queue = await QueueCounter.findOne().select("-__v");
    if (!queue) {
      queue = await QueueCounter.create({ lastKasir: 0, lastPenaksir: 0 });
    }
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data antrian" });
  }
};

exports.resetQueue = async (req, res) => {
  try {
    const queue = await QueueCounter.findOneAndUpdate(
      {},
      { lastKasir: 0, lastPenaksir: 0 },
      { new: true, upsert: true }
    );
    await Queue.deleteMany({});
    res.json({ message: "Antrian berhasil direset", queue });
  } catch (err) {
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};
