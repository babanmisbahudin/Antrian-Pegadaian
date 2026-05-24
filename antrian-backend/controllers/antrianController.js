const Queue = require("../models/queue");
const QueueCounter = require("../models/QueueCounter");

const PREFIX = { kasir: "K", penaksir: "P" };

const todayStr = () => new Date().toISOString().split("T")[0];

async function ensureDailyReset(counter) {
  const t = todayStr();
  if (!counter || counter.resetDate !== t) {
    await QueueCounter.findOneAndUpdate(
      {},
      { lastKasirAntrian: 0, lastPenaksirAntrian: 0, resetDate: t },
      { upsert: true }
    );
    await Queue.deleteMany({ status: "waiting" });
  }
}

exports.getAntrianStatus = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }
  try {
    const [waiting, last] = await Promise.all([
      Queue.countDocuments({ role, status: "waiting" }),
      Queue.findOne({ role }).sort({ waktu: -1 }),
    ]);
    res.json({ waiting, lastNomor: last ? last.nomor : null });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil status antrian" });
  }
};

exports.addAntrian = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  const counterField = role === "kasir" ? "lastKasirAntrian" : "lastPenaksirAntrian";

  try {
    const counter = await QueueCounter.findOne();
    await ensureDailyReset(counter);

    const updated = await QueueCounter.findOneAndUpdate(
      {},
      { $inc: { [counterField]: 1 } },
      { new: true, upsert: true }
    );

    const nomor = `${PREFIX[role]}-${updated[counterField].toString().padStart(3, "0")}`;
    const newQueue = await Queue.create({ role, nomor, loket: "-", status: "waiting" });
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

  const counterField = role === "kasir" ? "lastKasirAntrian" : "lastPenaksirAntrian";

  try {
    await Queue.deleteMany({ role });
    await QueueCounter.findOneAndUpdate(
      {},
      { [counterField]: 0, resetDate: todayStr() },
      { upsert: true }
    );
    res.json({ message: `Berhasil reset antrian ${role}` });
  } catch (err) {
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};
