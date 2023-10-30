const Resource = require("./Resource");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  thumbnail: {
    type: Schema.Types.ObjectId,
    ref: "Resource",
  }, //thumbnail
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
