const dotenv = require("dotenv");
dotenv.config();

const expressProxy = require("express-http-proxy");
const express = require("express");
const cors = require("cors");

const app = express();

console.log('aaya aaya aaaya ')
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const CAPTAIN_URL = process.env.CAPTAIN_URL || "http://localhost:3002";
const RIDE_URL = process.env.RIDE_URL || "http://localhost:3003";
const USERS_URL = process.env.USERS_URL || "http://localhost:3001";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);


app.use("/user", expressProxy(USERS_URL));
app.use("/captain", expressProxy(CAPTAIN_URL));
app.use("/ride", expressProxy(RIDE_URL));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Gateway is running on port ${PORT}`);
});