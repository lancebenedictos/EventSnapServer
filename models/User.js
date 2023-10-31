const Resource = require("./Resource");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  thumbnail: {
    type: Schema.Types.ObjectId,
    ref: "Resource",
  }, //thumbnail
});

UserSchema.pre("find", function (next) {
  this.populate("thumbnail");
  next();
});

UserSchema.pre("findOne", function (next) {
  this.populate("thumbnail");
  next();
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
