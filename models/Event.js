const Organizer = require("./Organizer");
const User = require("./User");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  organizers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Organizer",
    },
  ],
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  date: String,
  title: String,
});

EventSchema.methods.addOrganizer = function () {};
EventSchema.methods.removeOrganizer = function () {};

EventSchema.methods.addUser = function () {};

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
