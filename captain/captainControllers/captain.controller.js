const captainModel = require("../models/captain.model");
const bcrypt = require("bcrypt");
const BlacklistedTokenModel = require("../models/blacklisted.model");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await captainModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newCaptain = new captainModel({
      name,
      email,
      password: hashedPassword,
    });
    // Save the user to the database
    await newCaptain.save();
    const token = jwt.sign(
      { captainId: newCaptain._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token);

    res.status(201).json({ message: "Captain registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const captain = await captainModel.findOne({ email });

    if (!captain) {
      return res.status(401).json({ message: "Invalid captain Id" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, captain.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    // Generate a JWT token
    const token = jwt.sign({ captainId: captain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.send({ token, captain });

    // res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      await BlacklistedTokenModel.create({ token, createdAt: new Date() });
    }
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.profile = async (req, res) => {
  console.log("Captain profile accessed:", req.captain);
  try {
    res.send(req.captain);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.toggleAvailability = async (req, res) => {
  try {
    const captain = await captainModel.findById(req.captain._id);
    captain.isAvailable = !captain.isAvailable;
    await captain.save();
    res.send(captain);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
