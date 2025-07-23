const dotenv = require("dotenv");
const express = require("express");
const app = express();
const userRoutes = require("./routes/user.routes");
const cookiesParser = require("cookie-parser");
const connectDB = require("./db/db");

dotenv.config();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookiesParser());

app.use("/", userRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
