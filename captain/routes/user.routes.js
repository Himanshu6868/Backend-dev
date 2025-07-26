const express = require("express");
const router = express.Router();
const captainController = require("../captainControllers/captain.controller");
const authUserMiddleware = require("../middleware/authUserMiddleware");

router.post("/register", captainController.register);
router.post("/login", captainController.login);
router.get("/logout", captainController.logout);
router.patch(
  "/toggle-availability",
  authUserMiddleware.captainAuth,
  captainController.toggleAvailability
);

router.get(
  "/profile",
  authUserMiddleware.captainAuth,
  captainController.profile
);

module.exports = router;
