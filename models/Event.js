const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  organizer: {
    type: Schema.Types.ObjectId,
    ref: "Organizer",
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  attendees: [
    {
      first_name: String,
      last_name: String,
      email: String,
    },
  ],
  date: String,
  title: String,
  time: String,
  location: String,
  description: String,
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
