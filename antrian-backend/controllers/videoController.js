const Video = require("../models/video");

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File tidak ditemukan" });

    const video = new Video({ filename: req.file.filename });
    await video.save();

    res.status(201).json(video);
  } catch (err) {
    console.error("Gagal upload video:", err);
    res.status(500).json({ message: "Upload gagal" });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("Gagal ambil video:", err);
    res.status(500).json({ message: "Gagal ambil video" });
  }
};

exports.deleteVideo = async (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: "Video tidak ditemukan" });

    const filePath = path.join(__dirname, "..", "uploads", "video", video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "Video dihapus" });
  } catch (err) {
    console.error("Gagal hapus video:", err);
    res.status(500).json({ message: "Gagal hapus video" });
  }
};
