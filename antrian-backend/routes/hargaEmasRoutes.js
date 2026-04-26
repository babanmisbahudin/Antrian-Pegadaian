const express = require("express");
const router = express.Router();
const {
  getAllHarga,
  addHarga,
  updateHarga,
  deleteHarga,
} = require("../controllers/hargaEmasController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllHarga);
router.post("/", protect, adminOnly, addHarga);
router.put("/:id", protect, adminOnly, updateHarga);
router.delete("/:id", protect, adminOnly, deleteHarga);

module.exports = router;
