const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: Number, required: true, default: 1 },
  fingerprint: { type: String, required: true },
  content: { type: String, required: true },
  ip: { type: String, required: true },
  likes: { type: Number, required: true, default: 0 },
  dislikes: { type: Number, required: true, default: 0 },
  views: { type: Number, required: true, default: 0 },
  date: { type: Number, required: true }
});

module.exports = mongoose.model("comments", CommentsSchema);
