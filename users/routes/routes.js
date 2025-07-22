const express = require("express");
const router = express.Router();
const userController = require("../userControllers/user.controller");

router.post("/register", userController.register);

module.exports = router;
