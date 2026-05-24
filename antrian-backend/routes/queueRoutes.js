const express = require("express");
const router = express.Router();
const {
  getQueueStatus,
  resetQueue,
  callQueue,
  recallQueue,
  getLastCalled,
  getQueueLog,
  getWaitingList,
} = require("../controllers/queueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getQueueStatus);
router.get("/terakhir", getLastCalled);
router.get("/log", protect, adminOnly, getQueueLog);
router.get("/waiting/:role", protect, getWaitingList);
router.post("/call", protect, callQueue);
router.post("/recall", protect, recallQueue);
router.post("/reset", protect, adminOnly, resetQueue);

module.exports = router;
