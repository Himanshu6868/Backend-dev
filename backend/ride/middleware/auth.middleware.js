const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const USER_SERVICE_URL = process.env.USERS_URL || process.env.BASE_URL;
const CAPTAIN_SERVICE_URL = process.env.CAPTAIN_URL || process.env.BASE_URL;


const normalizeBaseUrl = (url = "") => url.replace(/\/$/, "");

const fetchProfileWithFallback = async ({ baseUrl, token, paths }) => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  let lastError;

  for (const path of paths) {
    try {
      const response = await axios.get(`${normalizedBase}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      lastError = error;

      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
};


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

    const user = await fetchProfileWithFallback({
      baseUrl: USER_SERVICE_URL,
      token,
      paths: ["/profile", "/user/profile"],
    });

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

   const captain = await fetchProfileWithFallback({
      baseUrl: CAPTAIN_SERVICE_URL,
      token,
      paths: ["/profile", "/captain/profile"],
    });

    // const captain = response.data;

    if (!captain) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.captain = captain;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
