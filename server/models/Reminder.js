const mongoose = require("mongoose");
const { Schema } = mongoose;

const reminderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: String, required: true }, 
    time: { type: String, default: null }, 
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "reminders" }
);

module.exports = mongoose.model("Reminder", reminderSchema);
