const expressProxy = require("express-http-proxy");
const express = require("express");

const app = express();

console.log('aaya aaya aaaya ')

app.use("/user", expressProxy("http://localhost:3001"));
app.use("/captain", expressProxy("http://localhost:3002"));
app.use("/ride", expressProxy("http://localhost:3003"));

app.listen(3000, () => {
  console.log("Gateway is running on port 3000");
});
