const express = require("express");
const router = express.Router();
const {
  getAntrianStatus,
  addAntrian,
  resetAntrian,
} = require("../controllers/antrianController");
const { protect, satpamOrAdmin } = require("../middleware/authMiddleware");

router.get("/:role/status", getAntrianStatus);
router.post("/:role/next", protect, satpamOrAdmin, addAntrian);
router.delete("/:role/reset", protect, satpamOrAdmin, resetAntrian);

module.exports = router;
