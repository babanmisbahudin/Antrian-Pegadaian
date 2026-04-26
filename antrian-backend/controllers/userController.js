const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const safeUser = (user) => ({
  _id: user._id,
  nama: user.nama,
  nik: user.nik,
  role: user.role,
  cabang: user.cabang,
  outlet: user.outlet,
  loket: user.loket,
});

exports.registerUser = async (req, res) => {
  const { nama, nik, cabang, outlet, loket, role, password } = req.body;

  if (!nama || !nik || !password || !role) {
    return res.status(400).json({ message: "Nama, NIK, password, dan role wajib diisi" });
  }

  try {
    const existingUser = await User.findOne({ nik });
    if (existingUser) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nama,
      nik,
      cabang: cabang || "",
      outlet: outlet || "",
      loket: role === "satpam" ? "-" : (loket || "-"),
      role,
      password: hashedPassword,
    });

    res.status(201).json(safeUser(newUser));
  } catch (err) {
    res.status(500).json({ message: "Server error saat register" });
  }
};

exports.loginUser = async (req, res) => {
  const { nik, password } = req.body;

  if (!nik || !password) {
    return res.status(400).json({ message: "NIK dan password wajib diisi" });
  }

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
      ...safeUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error saat login" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data user" });
  }
};

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

exports.updateUser = async (req, res) => {
  try {
    const { nama, nik, role, loket, cabang, outlet } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (nik && nik !== user.nik) {
      const duplicate = await User.findOne({ nik });
      if (duplicate) return res.status(400).json({ message: "NIK sudah digunakan" });
    }

    user.nama = nama || user.nama;
    user.nik = nik || user.nik;
    user.role = role || user.role;
    user.loket = role === "satpam" ? "-" : (loket || user.loket);
    user.cabang = cabang || user.cabang;
    user.outlet = outlet || user.outlet;

    await user.save();

    res.json(safeUser(user));
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
};
