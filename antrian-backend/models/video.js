const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
