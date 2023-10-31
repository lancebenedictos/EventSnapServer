const { createFaceCollection } = require("../libs/aws");
const asyncHandler = require("../middleware/asyncHandler");
const Event = require("../models/Event");

const router = require("express").Router();

router.get("/", () => {});

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate("users");
    return res.status(200).json({ data: { event } });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { body } = req;
    const { organizer_id, title, date } = body;
    const event = await Event.create({
      organizers: [organizer_id],
      title,
      date,
    });

    createFaceCollection(event._id.toString());

    res.status(200).json({ data: { event } });
  })
);

router.put("/:id", () => {});

router.patch("/:id", () => {});

router.delete("/:id", () => {});
module.exports = router;
