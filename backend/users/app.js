const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/user.routes");
const cookiesParser = require("cookie-parser");
const connectDB = require("./db/db");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true, // enable cookies and headers like Authorization
  })
);

const rabbitMq = require("./service/rabbit");

rabbitMq.connect();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookiesParser());

app.use("/", userRoutes);

module.exports = app;
