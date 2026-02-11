const dotenv = require("dotenv");
dotenv.config();

const expressProxy = require("express-http-proxy");
const express = require("express");
const cors = require("cors");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const CAPTAIN_URL = process.env.CAPTAIN_URL || "http://localhost:3002";
const RIDE_URL = process.env.RIDE_URL || "http://localhost:3003";
const USERS_URL = process.env.USERS_URL || "http://localhost:3001";

const allowedOrigins = FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: true, // allow all origins in dev
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// const PROXY_TIMEOUT = 60000; 

// const createProxy = (target) =>
//   expressProxy(target, {
//     timeout: PROXY_TIMEOUT,

//     proxyReqOptDecorator: (proxyReqOpts) => {
//       proxyReqOpts.timeout = PROXY_TIMEOUT;
//       return proxyReqOpts;
//     },

//     proxyErrorHandler: (err, res, next) => {
//       console.error("Proxy error:", err.message);

//       res.status(502).json({
//         message: "Upstream service unavailable",
//         error: err.code || err.message,
//       });
//     },
//   });

//   app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 1000, // increase
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );


app.use("/user", expressProxy(USERS_URL));
app.use("/captain", expressProxy(CAPTAIN_URL));
app.use("/ride", expressProxy(RIDE_URL));

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway is running on port ${PORT}`);
});