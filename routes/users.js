const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const Resource = require("../models/Resource");
const {
  matchFaceInCollection,
  uploadThumbnail,
  indexImage,
  findFaces,
} = require("../libs/aws");
const User = require("../models/User");
const Event = require("../models/Event");
const { uploadMiddleware } = require("../middleware/multer");
const { authenticate } = require("../middleware/auth");

// Get specific persons images

router.post(
  "/:eventId/thumbnail",
  uploadMiddleware,
  asyncHandler(async (req, res) => {
    // use rekognition first if face is registered

    console.log("hit");

    const matches = await matchFaceInCollection(
      req.files[0].buffer,
      req.params.eventId
    );

    if (matches.length === 0) {
      // new face
      const resource = new Resource();
      const resourceId = resource._id.toString();
      const location = await uploadThumbnail(
        req.files[0],
        req.params.eventId,
        resourceId
      );
      const indexed = await indexImage(
        req.files[0].buffer,
        req.params.eventId,
        resourceId,
        1
      );

      resource.downloadUrl = location;
      resource.faceId = indexed.FaceRecords[0].Face.FaceId;

      const user = await User.create({
        thumbnail: resourceId,
      });
      await resource.save();
      const event = await Event.findOneAndUpdate(
        { _id: req.params.eventId },
        { $push: { users: user._id } },
        { new: true }
      ).populate("users");

      res.status(200).json({ event });
    }
  })
);

router.get(
  "/:eventId/images/:userId",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    console.log(user);
    const resources = await findFaces(
      req.params.eventId,
      user.thumbnail._id.toString()
    );

    console.log(resources);

    if (resources) {
      return res.status(200).json({ resources });
    }
  })
);

// add new
// router.put("/:id", () => {});

router.delete("/:id", () => {});

module.exports = router;
