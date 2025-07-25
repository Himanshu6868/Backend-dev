const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(3003, () => {
  console.log("Port is running on 3003");
});
