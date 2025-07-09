const Antrian = require("../models/Antrian");

// GET /api/antrian/kasir?loket=2
exports.getAntrianKasir = async (req, res) => {
  try {
    const loket = parseInt(req.query.loket);
    const antrian = await Antrian.find({
      tujuan: "kasir",
      loket,
      status: "menunggu",
    }).sort({ waktu: 1 });
    res.json(antrian);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil antrian" });
  }
};

// POST /api/antrian/panggil
exports.panggilAntrian = async (req, res) => {
  try {
    const { id, loket } = req.body;
    await Antrian.findByIdAndUpdate(id, {
      status: "dipanggil",
      loket,
    });
    res.json({ message: "Antrian dipanggil" });
  } catch (error) {
    res.status(500).json({ message: "Gagal panggil antrian" });
  }
};

// POST /api/antrian/reset
exports.resetAntrian = async (req, res) => {
  try {
    const { id } = req.body;
    await Antrian.findByIdAndUpdate(id, { status: "batal" });
    res.json({ message: "Antrian direset" });
  } catch (error) {
    res.status(500).json({ message: "Gagal reset antrian" });
  }
};

// POST /api/antrian/mulai
exports.mulaiAntrianAwal = async (req, res) => {
  try {
    const {
      jumlah = 10,
      prefix = "K",
      start = 101,
      tujuan = "kasir",
      loket = 2,
    } = req.body;

    const antreanBaru = [];

    for (let i = 0; i < jumlah; i++) {
      const nomor = `${prefix}-${start + i}`;
      antreanBaru.push({
        nomor,
        tujuan,
        loket,
        status: "menunggu",
        waktu: new Date(),
      });
    }

    const hasil = await Antrian.insertMany(antreanBaru);
    res.json({ message: "Antrian awal berhasil dimulai", data: hasil });
  } catch (err) {
    res.status(500).json({ message: "Gagal mulai antrian awal" });
  }
};
