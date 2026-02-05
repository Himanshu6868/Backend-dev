const dotenv = require("dotenv");
dotenv.config();

const expressProxy = require("express-http-proxy");
const express = require("express");
const cors = require("cors");

const app = express();

console.log('aaya aaya aaaya ')
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);


app.use("/user", expressProxy("https://verbose-succotash-r4g4w49v7w4g2pw6q-3001.app.github.dev"));
app.use("/captain", expressProxy("http://localhost:3002"));
app.use("/ride", expressProxy("http://localhost:3003"));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Gateway is running on port ${PORT}`);
});