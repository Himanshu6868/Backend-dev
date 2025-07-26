const mongoose = require("mongoose");

const blackListedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
    expires: 3600,
  },
});

module.exports = mongoose.model("blacklistedToken", blackListedTokenSchema);
