const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  faceId: String,
  downloadUrl: String,
});
const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
