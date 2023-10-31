const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const Resource = require("../models/Resource");
const {
  uploadMiddleware,
  matchFaceInCollection,
  uploadThumbnail,
  indexImage,
  findFaces,
} = require("../libs/aws");
const User = require("../models/User");
const Event = require("../models/Event");

// Get specific persons images
router.get(
  "/:eventId/:userId",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    const resources = await findFaces(
      req.params.eventId,
      user.thumbnail._id.toString()
    );
    if (resources) {
      return res.status(200).json({ data: { resources } });
    }
  })
);

router.post(
  "/:id",
  uploadMiddleware,
  asyncHandler(async (req, res) => {
    // use rekognition first if face is registered
    const matches = await matchFaceInCollection(
      req.files[0].buffer,
      req.params.id
    );

    if (matches.length === 0) {
      // new face
      const resource = new Resource();
      const resourceId = resource._id.toString();
      const location = await uploadThumbnail(
        req.files[0],
        req.params.id,
        resourceId
      );
      const indexed = await indexImage(
        req.files[0].buffer,
        req.params.id,
        resourceId,
        1
      );

      resource.downloadUrl = location;
      resource.faceId = indexed.FaceRecords[0].Face.FaceId;

      const user = await User.create({
        thumbnail: resourceId,
      });
      await resource.save();
      await Event.updateOne(
        { _id: req.params.id },
        { $push: { users: user._id } }
      );

      res.status(200).json({ data: { user } });
    }
  })
);

// add new
router.put("/:id", () => {});

router.delete("/:id", () => {});
module.exports = router;
