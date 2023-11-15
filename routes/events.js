const { createFaceCollection } = require("../libs/aws");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate } = require("../middleware/auth");
const Event = require("../models/Event");

const router = require("express").Router();

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const { user } = req;
    const { _id } = user;

    const events = await Event.find({ organizer: _id });

    res.status(200).json({ events });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id)
      .populate("organizer")
      .populate("attendees")
      .populate("users");

    if (!event) return next({ statusCode: 401, message: "Not found" });
    return res.status(200).json({ event });
  })
);

router.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const event = await Event.create({
      organizer: req.user._id,
    });

    createFaceCollection(event._id.toString());

    res.status(200).json({ event });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!event) return res.status(404);

    res.status(200).json({ event });
  })
);

router.delete("/:id", () => {});

router.post(
  "/:eventId/users",
  asyncHandler(async (req, res, next) => {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
    }).populate("attendees");

    if (!event) return next({ statusCode: 404, message: "Event not found" });
    console.log(event);
    if (event.attendees.find((e) => e.email === req.body.user.email)) {
      return next({ statusCode: 400, message: "User already registered" });
    } else {
      event.attendees.push(req.body.user);
      event.save();
      return res.status(200).json({ message: "success" });
    }
  })
);

router.delete(
  "/:eventId/users/:userId",
  asyncHandler(async (req, res, next) => {
    console.log("hit");
    const event = await Event.findById(req.params.eventId).populate(
      "attendees"
    );

    if (!event) return next({ statusCode: 404, message: "Event not found" });

    event.attendees.pull({ _id: req.params.userId });
    event.save();
    console.log(req.params.userId);
    return res.status(200).json({ event });
  })
);
module.exports = router;
