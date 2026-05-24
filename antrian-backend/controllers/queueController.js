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
    const next = await Queue.findOneAndUpdate(
      { role, status: "waiting" },
      { status: "called", loket, dipanggilOleh: req.user?._id, waktu: new Date() },
      { sort: { waktu: 1 }, new: true }
    );

    if (!next) {
      return res.status(404).json({ message: "Tidak ada antrian yang menunggu" });
    }

    res.json({ message: "Antrian dipanggil", data: next });
  } catch (err) {
    console.error("Error callQueue:", err);
    res.status(500).json({ message: "Gagal memanggil antrian" });
  }
};

exports.getWaitingList = async (req, res) => {
  const { role } = req.params;
  if (!["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }
  try {
    const list = await Queue.find({ role, status: "waiting" }).sort({ waktu: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil daftar antrian" });
  }
};

exports.getLastCalled = async (req, res) => {
  try {
    const [lastKasir, lastPenaksir] = await Promise.all([
      Queue.findOne({ role: "kasir", status: "called" }).sort({ waktu: -1 }),
      Queue.findOne({ role: "penaksir", status: "called" }).sort({ waktu: -1 }),
    ]);
    res.json({ kasir: lastKasir || null, penaksir: lastPenaksir || null });
  } catch (err) {
    console.error("Error getLastCalled:", err);
    res.status(500).json({ message: "Gagal ambil antrian terakhir" });
  }
};

exports.recallQueue = async (req, res) => {
  const { role, loket } = req.body;
  if (!role || !["kasir", "penaksir"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }
  try {
    const last = await Queue.findOneAndUpdate(
      { role, status: "called" },
      { recalledAt: new Date() },
      { sort: { waktu: -1 }, new: true }
    );
    if (!last) {
      return res.status(404).json({ message: "Tidak ada antrian yang sedang dipanggil" });
    }
    res.json({ message: "Antrian diulang", data: last });
  } catch (err) {
    console.error("Error recallQueue:", err);
    res.status(500).json({ message: "Gagal mengulang panggilan" });
  }
};

exports.getQueueLog = async (req, res) => {
  try {
    const logs = await Queue.find({ status: "called" })
      .sort({ waktu: -1 })
      .limit(100)
      .populate("dipanggilOleh", "nama role");
    const formatted = logs.map((l) => ({
      waktu: l.waktu,
      nomor: l.nomor,
      loket: l.loket,
      role: l.role,
      user: l.dipanggilOleh ? l.dipanggilOleh.nama : l.role,
      aksi: "Dipanggil",
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil log" });
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
      { lastKasir: 0, lastPenaksir: 0, lastKasirAntrian: 0, lastPenaksirAntrian: 0, resetDate: "" },
      { new: true, upsert: true }
    );
    await Queue.deleteMany({});
    res.json({ message: "Antrian berhasil direset", queue });
  } catch (err) {
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};
