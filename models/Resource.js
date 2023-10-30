const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
  faceId: String,
  downloadUrl: String,
});
const Resource = mongoose.model("Resource", ResourceSchema);

module.exports = Resource;
