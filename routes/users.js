const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const {
  uploadFiles,
  uploadMiddleware,
  matchFaceInCollection,
  uploadThumbnail,
  indexImage,
} = require("../libs/aws");
const User = require("../models/User");
// Get all images
router.get("/", () => {});

// Get specific persons images
router.get("/:id", () => {});

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
      const resourceId = await uploadThumbnail(req.files[0], req.params.id);
      await indexImage(req.files[0].buffer, req.params.id, resourceId, 1);
      const user = await User.create({ thumbnail: resourceId });
      res.status(200).json({ data: { user } });
    }
  })
);

// add new
router.put("/:id", () => {});

router.delete("/:id", () => {});
module.exports = router;
