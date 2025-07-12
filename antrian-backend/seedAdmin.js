require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user"); // Pastikan path ini sesuai

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ Terkoneksi ke MongoDB");

  const existing = await User.findOne({ nik: "admin" });
  if (existing) {
    console.log("⚠️ Admin dengan NIK 'admin' sudah ada. Hapus dulu jika ingin buat ulang.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new User({
    nama: "Admin Pegadaian",
    nik: "admin", // 🟢 NIK-nya di-set jadi 'admin'
    cabang: "Majalengka",
    outlet: "Pusat",
    password: hashedPassword,
    role: "admin",
  });

  await admin.save();
  console.log("✅ User admin berhasil dibuat dengan NIK: 'admin' dan password: 'admin123'");
  process.exit(0);
})
.catch((err) => {
  console.error("❌ Gagal konek ke database:", err);
  process.exit(1);
});
