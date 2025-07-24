const express = require("express");
const router = express.Router();
const userController = require("../userControllers/user.controller");
const authUserMiddleware = require("../middleware/authUserMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.get("/profile", authUserMiddleware.authUser, userController.profile);

module.exports = router;
