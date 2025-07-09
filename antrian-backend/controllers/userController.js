const User = require("../models/user");

// Login
exports.loginUser = async (req, res) => {
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

    res.json({
      _id: user._id,
      nik: user.nik,
      nama: user.nama,
      role: user.role,
      cabang: user.cabang,
      outlet: user.outlet,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Register
exports.registerUser = async (req, res) => {
  const { nik, nama, password, role, cabang, outlet } = req.body;

  if (!nik || !nama || !password || !role || !cabang || !outlet) {
    return res.status(400).json({ message: "Semua data wajib diisi" });
  }

  try {
    const existing = await User.findOne({ nik });
    if (existing) {
      return res.status(409).json({ message: "NIK sudah terdaftar" });
    }

    const newUser = new User({ nik, nama, password, role, cabang, outlet });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Gagal mendaftar" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Gagal ambil user:", err);
    res.status(500).json({ message: "Gagal ambil data user" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nik, nama, role, cabang, outlet } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { nik, nama, role, cabang, outlet },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Gagal update user" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Gagal hapus user" });
  }
};
