const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const videoController = require("../controllers/videoController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/video");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Hanya file video yang diizinkan"));
    }
    cb(null, true);
  },
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.get("/", videoController.getAllVideos);
router.post("/upload", protect, adminOnly, upload.single("video"), videoController.uploadVideo);
router.delete("/:id", protect, adminOnly, videoController.deleteVideo);

module.exports = router;
