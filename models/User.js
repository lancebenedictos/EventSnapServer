const Image = require("./Image");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  thumbnail: Image, //thumbnail
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
