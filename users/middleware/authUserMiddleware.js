const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const BlacklistedTokenModel = require("../models/blacklisted.model");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const blacklistedToken = await BlacklistedTokenModel.findOne({ token });
  if (blacklistedToken) {
    return res.status(401).json({ message: "Token is blacklisted" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await userModel.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  req.user = user;
  next();
};
