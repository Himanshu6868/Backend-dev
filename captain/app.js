const dotenv = require("dotenv");
const express = require("express");
const app = express();
const captainRoutes = require("./routes/user.routes");
const cookiesParser = require("cookie-parser");
const connectDB = require("./db/db");

dotenv.config();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookiesParser());

app.use("/", captainRoutes);

module.exports = app;
