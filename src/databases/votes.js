const mongoose = require("mongoose");

const VotesSchema = new mongoose.Schema({
  id: { type: String, required: true },
  comment: { type: String, required: true },
  fingerprint: { type: String, required: true },
  ip: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Number, required: true }
});

module.exports = mongoose.model("votes", VotesSchema);