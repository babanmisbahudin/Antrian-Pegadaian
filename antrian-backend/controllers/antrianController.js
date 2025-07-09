const Queue = require("../models/Queue");

const DEFAULT_START = {
  kasir: 1001,
  penaksir: 2001,
};

// Ambil nomor terakhir
exports.getLastAntrian = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    const last = await Queue.findOne({ role }).sort({ nomor: -1 });
    res.json({ nomor: last ? last.nomor : DEFAULT_START[role] - 1 });
  } catch (err) {
    console.error(`❌ Gagal ambil last ${role}:`, err);
    res.status(500).json({ message: "Gagal ambil antrian" });
  }
};

// Tambah antrian baru
exports.addAntrian = async (req, res) => {
  const { role } = req.params;
  const { loket } = req.body;

  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    const last = await Queue.findOne({ role }).sort({ nomor: -1 });
    const nextNomor = last ? last.nomor + 1 : DEFAULT_START[role];

    const newQueue = new Queue({
      role,
      nomor: nextNomor,
      loket: loket || (role === "kasir" ? "2" : "1"),
    });

    await newQueue.save();
    res.status(201).json(newQueue);
  } catch (err) {
    console.error(`❌ Gagal tambah antrian ${role}:`, err);
    res.status(500).json({ message: "Gagal tambah antrian" });
  }
};

// Reset antrian
exports.resetAntrian = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    await Queue.deleteMany({ role });
    res.json({ message: `Berhasil reset antrian ${role}` });
  } catch (err) {
    console.error(`❌ Gagal reset antrian ${role}:`, err);
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};
