const dotenv = require("dotenv");
const express = require("express");
const app = express();
const router = require("./routes/routes");
const cookiesParser = require("cookie-parser");
const connectDB = require("./db/db");

dotenv.config();

connectDB();

app.use(express.json());
app.use(cookiesParser());

app.get("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
