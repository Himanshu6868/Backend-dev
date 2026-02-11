const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const BlacklistedTokenModel = require("../models/blacklisted.model");
const jwt = require("jsonwebtoken");
const { subscribeToQueue } = require("../service/rabbit");
const EventEmitter = require("events");
const rideEventEmitter = new EventEmitter();
rideEventEmitter.setMaxListeners(50);

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    // Save the user to the database
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);
    res.cookie("ride-role", "rider");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid User Id" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.cookie("ride-role", "rider");
    res.send({ token, user });

    // res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const bearerToken = req.headers.authorization?.split(" ")[1];
    const token = req.cookies.token || bearerToken;
    if (token) {
      await BlacklistedTokenModel.create({ token, createdAt: new Date() });
    }
    res.clearCookie("token");
    res.clearCookie("ride-role");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.profile = async (req, res) => {
  console.log("User profile accessed:", req.user);
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.acceptedRide = async (req, res) => {
  // Flag to prevent multiple responses
  let responseSent = false;

  // Handler function for ride-accepted event
  const rideAcceptedHandler = (data) => {
    if (!responseSent) {
      responseSent = true;
      clearTimeout(timeoutId);
      res.send(data);
    }
  };

  // Long polling: wait for 'ride-accepted' event
  rideEventEmitter.once("ride-accepted", rideAcceptedHandler);

  // Set timeout for long polling (e.g., 30 seconds)
  const timeoutId = setTimeout(() => {
    if (!responseSent) {
      responseSent = true;
      rideEventEmitter.removeListener("ride-accepted", rideAcceptedHandler);
      res.status(204).send();
    }
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    if (!responseSent) {
      responseSent = true;
      clearTimeout(timeoutId);
      rideEventEmitter.removeListener("ride-accepted", rideAcceptedHandler);
    }
  });
};
