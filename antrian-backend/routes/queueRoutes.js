const express = require("express");
const router = express.Router();
const {
  getQueueStatus,
  resetQueue,
  callQueue,
  getLastCalled,
} = require("../controllers/queueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getQueueStatus);
router.get("/terakhir", getLastCalled);
router.post("/call", protect, callQueue);
router.post("/reset", protect, adminOnly, resetQueue);

module.exports = router;
