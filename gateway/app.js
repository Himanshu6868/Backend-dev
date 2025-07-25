const expressProxy = require("express-http-proxy");
const express = require("express");

const app = express();

app.use("/user", expressProxy("http://localhost:3001"));
app.use("/captain", expressProxy("http://localhost:3002"));

app.listen(3000, () => {
  console.log("Gateway is running on port 3000");
});
