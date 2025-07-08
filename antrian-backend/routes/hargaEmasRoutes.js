const express = require("express");
const router = express.Router();
const {
  getAllHarga,
  addHarga,
  updateHarga,
  deleteHarga
} = require("../controllers/hargaEmasController");

// [GET] Ambil semua data harga emas
// Endpoint: GET /api/harga-emas
router.get("/", getAllHarga);

// [POST] Tambah satu data harga emas baru
// Endpoint: POST /api/harga-emas
router.post("/", addHarga);

// [PUT] Update satu data harga emas berdasarkan _id (di body)
// Endpoint: PUT /api/harga-emas
router.put("/", updateHarga);

// [DELETE] Hapus satu data harga emas berdasarkan :id
// Endpoint: DELETE /api/harga-emas/:id
router.delete("/:id", deleteHarga);

module.exports = router;
