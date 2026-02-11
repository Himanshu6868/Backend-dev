const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const connect = require("./db/db");
connect();
const cookieParser = require("cookie-parser");
const rideRoutes = require("./routes/ride.routes");
const rabbitMq = require("./service/rabbit");

rabbitMq.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ride-service",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/", rideRoutes);

module.exports = app;
