const express = require("express");
const router = express.Router();
const User = require("../models/user");

// LOGIN USER (tanpa loket)
router.post("/login", async (req, res) => {
  const { nik, password } = req.body;

  if (!nik || !password) {
    return res.status(400).json({ message: "NIK dan password wajib diisi" });
  }

  try {
    const user = await User.findOne({ nik });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Password salah" });
    }

    // ✅ Kembalikan tanpa loket
    res.json({
      _id: user._id,
      nik: user.nik,
      nama: user.nama,
      role: user.role,
      cabang: user.cabang,
      outlet: user.outlet
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
