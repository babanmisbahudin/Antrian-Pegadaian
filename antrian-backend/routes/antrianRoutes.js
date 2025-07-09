const express = require("express");
const router = express.Router();
const {
  getLastAntrian,
  addAntrian,
  resetAntrian,
} = require("../controllers/antrianController");

// 🧾 Route Kasir & Penaksir → pakai param `:role` biar efisien
router.get("/:role/last", getLastAntrian);
router.post("/:role/next", addAntrian);
router.delete("/:role/reset", resetAntrian);

module.exports = router;
