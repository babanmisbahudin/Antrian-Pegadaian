const Queue = require("../models/Queue");
const QueueCounter = require("../models/QueueCounter");

const ANTRIAN_START = { kasir: 1000, penaksir: 2000 };

exports.getLastAntrian = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }
  try {
    const counterField = role === "kasir" ? "lastKasirAntrian" : "lastPenaksirAntrian";
    const counter = await QueueCounter.findOne();
    const raw = counter ? counter[counterField] : 0;
    res.json({ nomor: ANTRIAN_START[role] + raw });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil antrian" });
  }
};

exports.addAntrian = async (req, res) => {
  const { role } = req.params;
  const { loket } = req.body;

  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    const counterField = role === "kasir" ? "lastKasirAntrian" : "lastPenaksirAntrian";

    const counter = await QueueCounter.findOneAndUpdate(
      {},
      { $inc: { [counterField]: 1 } },
      { new: true, upsert: true }
    );

    // Nomor = offset + counter (e.g. 1000 + 1 = 1001)
    const nextNomor = ANTRIAN_START[role] + counter[counterField];

    const newQueue = new Queue({
      role,
      nomor: String(nextNomor),
      loket: loket || (role === "kasir" ? "2" : "1"),
      status: "waiting",
    });

    await newQueue.save();
    res.status(201).json(newQueue);
  } catch (err) {
    console.error(`Gagal tambah antrian ${role}:`, err);
    res.status(500).json({ message: "Gagal tambah antrian" });
  }
};

exports.resetAntrian = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    const counterField = role === "kasir" ? "lastKasirAntrian" : "lastPenaksirAntrian";

    await Queue.deleteMany({ role, status: "waiting" });
    await QueueCounter.findOneAndUpdate(
      {},
      { [counterField]: 0 },
      { upsert: true }
    );

    res.json({ message: `Berhasil reset antrian ${role}` });
  } catch (err) {
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};
