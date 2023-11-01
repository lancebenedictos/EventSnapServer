const router = require("express").Router();
const { uploadFiles } = require("../libs/aws");
const asyncHandler = require("../middleware/asyncHandler");
const { uploadMiddleware } = require("../middleware/multer");

router.post(
  "/:id",
  uploadMiddleware,
  asyncHandler(async (req, res) => {
    await uploadFiles(req.files, "event-thumbnails-1", req.params.id);

    res.status(200).json({ message: "success" });
  })
);
module.exports = router;
