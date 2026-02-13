const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const BlacklistedTokenModel = require("../models/blacklisted.model");
const jwt = require("jsonwebtoken");
const { subscribeToQueue } = require("../service/rabbit");
const EventEmitter = require("events");

const rideEventEmitter = new EventEmitter();
rideEventEmitter.setMaxListeners(100);

const rideUpdateBuffer = new Map();

const getRideKey = ({ userId, rideId }) => `${String(userId)}:${String(rideId)}`;

const storeRideUpdate = (rideData) => {
  if (!rideData?.user || !rideData?._id) {
    return;
  }

  const key = getRideKey({ userId: rideData.user, rideId: rideData._id });
  rideUpdateBuffer.set(key, rideData);
};

const getAndClearRideUpdate = ({ userId, rideId }) => {
  const key = getRideKey({ userId, rideId });
  const cachedRide = rideUpdateBuffer.get(key);

  if (cachedRide) {
    rideUpdateBuffer.delete(key);
  }

  return cachedRide;
};

subscribeToQueue("ride-updated", (data) => {
  try {
    const rideData = JSON.parse(data);

    if (!["accepted", "cancelled"].includes(rideData?.status)) {
      return;
    }

    storeRideUpdate(rideData);

    const eventName = getRideKey({ userId: rideData.user, rideId: rideData._id });
    rideEventEmitter.emit(eventName, rideData);
  } catch (error) {
    console.error("Failed to process ride-updated message", error);
  }
});

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
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
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid User Id" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.cookie("ride-role", "rider");
    res.send({ token, user });
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
  const { rideId } = req.query;

  if (!rideId) {
    return res.status(400).json({ message: "rideId query parameter is required" });
  }

  const userId = req.user._id;
  const cachedRide = getAndClearRideUpdate({ userId, rideId });

  if (cachedRide) {
    return res.send(cachedRide);
  }

  let responseSent = false;
  const eventName = getRideKey({ userId, rideId });

  const rideAcceptedHandler = (data) => {
    if (!responseSent) {
      responseSent = true;
      clearTimeout(timeoutId);
      res.send(data);
    }
  };

  rideEventEmitter.once(eventName, rideAcceptedHandler);

  const timeoutId = setTimeout(() => {
    if (!responseSent) {
      responseSent = true;
      rideEventEmitter.removeListener(eventName, rideAcceptedHandler);
      res.status(204).send();
    }
  }, 30000);

  req.on("close", () => {
    if (!responseSent) {
      responseSent = true;
      clearTimeout(timeoutId);
      rideEventEmitter.removeListener(eventName, rideAcceptedHandler);
    }
  });
};
