const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const USER_SERVICE_URL = process.env.USERS_URL || process.env.BASE_URL;
const CAPTAIN_SERVICE_URL = process.env.CAPTAIN_URL || process.env.BASE_URL;

module.exports.userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = req.cookies.token || bearerToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await axios.get(`${USER_SERVICE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = response.data;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.captainAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = req.cookies.token || bearerToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await axios.get(
      `${CAPTAIN_SERVICE_URL}/captain/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const captain = response.data;

    if (!captain) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.captain = captain;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
