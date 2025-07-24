const express = require("express");
const router = express.Router();
const userController = require("../userControllers/user.controller");
const authUserMiddleware = require("../middleware/authUserMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/profile", authUserMiddleware.authUser, userController.profile);

module.exports = router;
