const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String }, // name of user or system
  date: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: String, required: true }, // name of the admin/user
  role: { type: String, default: "user" }, // role of the commenter
  date: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  issue: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  tags: [{ type: String }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  activities: [activitySchema],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);
