const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },
    nik: {
      type: String,
      required: true,
      unique: true,
    },
    cabang: {
      type: String,
      required: true,
    },
    outlet: {
      type: String,
      required: true,
    },
    loket: {
      type: String,
      required: function () {
        return this.role !== "satpam"; // ❗ wajib isi loket kecuali satpam
      },
      default: "-",
    },
    role: {
      type: String,
      enum: ["admin", "penaksir", "kasir", "satpam"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // akan mencatat createdAt dan updatedAt otomatis
  }
);

// Mencegah duplikasi model saat hot reload / pengujian
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
