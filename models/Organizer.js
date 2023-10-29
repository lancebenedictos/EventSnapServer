const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OrganizerSchema = new Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  password: String,
});
const Organizer = mongoose.model("Organizer", OrganizerSchema);

module.exports = Organizer;
