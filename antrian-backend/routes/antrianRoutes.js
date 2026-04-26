const express = require("express");
const router = express.Router();
const {
  getLastAntrian,
  addAntrian,
  resetAntrian,
} = require("../controllers/antrianController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/:role/last", getLastAntrian);
router.post("/:role/next", protect, addAntrian);
router.delete("/:role/reset", protect, adminOnly, resetAntrian);

module.exports = router;
