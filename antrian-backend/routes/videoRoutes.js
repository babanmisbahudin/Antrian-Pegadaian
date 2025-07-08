const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const videoController = require("../controllers/videoController");

// Set multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/video");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("video"), videoController.uploadVideo);
router.get("/", videoController.getAllVideos);
router.delete("/:id", videoController.deleteVideo);

module.exports = router;
