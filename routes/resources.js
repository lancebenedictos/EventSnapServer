const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const { uploadMiddleware, uploadFiles } = require("../libs/aws");

router.post(
  "/:id",
  uploadMiddleware,
  asyncHandler(async (req, res) => {
    await uploadFiles(req.files, "event-thumbnails-1", req.params.id);

    res.status(200).json({ message: "success" });
  })
);
module.exports = router;
