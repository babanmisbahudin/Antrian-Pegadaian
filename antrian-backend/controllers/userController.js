const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper untuk generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register
exports.registerUser = async (req, res) => {
  const { nama, nik, cabang, outlet, loket, role, password } = req.body;

  try {
    // Cek jika NIK sudah dipakai
    const existingUser = await User.findOne({ nik });
    if (existingUser) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nama,
      nik,
      cabang,
      outlet,
      loket: role === "satpam" ? "-" : loket,
      role,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: newUser._id,
      nama: newUser.nama,
      role: newUser.role,
      token: generateToken(newUser._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error saat register" });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { nik, password } = req.body;

  try {
    const user = await User.findOne({ nik });
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    res.json({
      _id: user._id,
      nama: user.nama,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error saat login" });
  }
};

// Ambil semua user (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data user" });
  }
};

// Hapus user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus user" });
  }
  };

  // Edit user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { nama, nik, role, loket, cabang, outlet } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    user.nama = nama || user.nama;
    user.nik = nik || user.nik;
    user.role = role || user.role;
    user.loket = role === "satpam" ? "-" : loket || user.loket;
    user.cabang = cabang || user.cabang;
    user.outlet = outlet || user.outlet;

    const updated = await user.save();

    res.json({
      _id: updated._id,
      nama: updated.nama,
      nik: updated.nik,
      role: updated.role,
      loket: updated.loket,
      cabang: updated.cabang,
      outlet: updated.outlet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
  };



