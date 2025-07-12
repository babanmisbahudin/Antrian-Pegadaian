const express = require("express");
const router = express.Router();
const { getQueueStatus, resetQueue } = require("../controllers/queueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getQueueStatus);
router.post("/reset", protect, adminOnly, resetQueue);
router.get("/", getQueueStatus);         // GET status antrian (kasir/penaksir)
router.post("/reset", resetQueue);       // POST reset antrian
router.post("/call", callQueue);         // POST panggil antrian
router.get("/terakhir", getLastCalled);  // GET antrian terakhir

module.exports = router;
