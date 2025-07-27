const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const captainRoutes = require("./routes/user.routes");
const cookiesParser = require("cookie-parser");
const connectDB = require("./db/db");
connectDB();
const rabbitMq = require("./service/rabbit");

rabbitMq.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookiesParser());

app.use("/", captainRoutes);

module.exports = app;
