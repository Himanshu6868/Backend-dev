const rideModel = require("../models/ride.model");
const { subscribeToQueue, publishToQueue } = require("../service/rabbit");

module.exports.createRide = async (req, res, next) => {
  const { pickup, destination } = req.body;

  const newRide = new rideModel({
    user: req.user._id,
    pickup,
    destination,
  });

  await newRide.save();
  publishToQueue("new-ride", JSON.stringify(newRide));
  res.send(newRide);
};

module.exports.acceptRide = async (req, res, next) => {
  const { rideId } = req.query;
  const ride = await rideModel.findById(rideId);
  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  ride.status = "accepted";
  ride.captain = req.captain._id;
  await ride.save();

  publishToQueue("ride-accepted", JSON.stringify(ride));
  publishToQueue("ride-updated", JSON.stringify(ride));

  res.send(ride);
};

module.exports.cancelRideByUser = async (req, res, next) => {
  const { rideId } = req.query;
  const ride = await rideModel.findById(rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (String(ride.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only cancel your own ride" });
  }

  if (["completed", "cancelled"].includes(ride.status)) {
    return res.status(400).json({ message: `Ride is already ${ride.status}` });
  }

  ride.status = "cancelled";
  await ride.save();
  publishToQueue("ride-updated", JSON.stringify(ride));

  res.send(ride);
};

module.exports.cancelRideByCaptain = async (req, res, next) => {
  const { rideId } = req.query;
  const ride = await rideModel.findById(rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.captain && String(ride.captain) !== String(req.captain._id)) {
    return res.status(403).json({ message: "This ride is assigned to another captain" });
  }

  if (["completed", "cancelled"].includes(ride.status)) {
    return res.status(400).json({ message: `Ride is already ${ride.status}` });
  }

  ride.captain = req.captain._id;
  ride.status = "cancelled";
  await ride.save();
  publishToQueue("ride-updated", JSON.stringify(ride));

  res.send(ride);
};
