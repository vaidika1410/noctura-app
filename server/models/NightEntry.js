
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NightEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, 
      required: true,
    },


    topTasks: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

   
    reflection: {
      type: String,
      default: "",
    },

   
    shutdownHabits: [
      {
        habitId: { type: Schema.Types.ObjectId, ref: "Habit" },
        completed: { type: Boolean, default: false },
      },
    ],

    
    historyNotes: [
      {
        date: { type: String }, 
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

NightEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("NightEntry", NightEntrySchema);
