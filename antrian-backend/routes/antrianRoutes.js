const express = require("express");
const router = express.Router();
const {
  getAntrianKasir,
  panggilAntrian,
  resetAntrian,
  mulaiAntrianAwal,
} = require("../controllers/antrianController");

router.get("/kasir", getAntrianKasir);
router.post("/panggil", panggilAntrian);
router.post("/reset", resetAntrian);
router.post("/mulai", mulaiAntrianAwal);

module.exports = router;
