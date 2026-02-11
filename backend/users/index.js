const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/user.routes");
const cookiesParser = require("cookie-parser");
const connectDB = require("./db/db");
const cors = require("cors");

// CORS handled by gateway, no CORS needed here

const rabbitMq = require("./service/rabbit");

rabbitMq.connect();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookiesParser());

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "users-service",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/", userRoutes);

module.exports = app;
