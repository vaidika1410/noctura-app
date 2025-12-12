const mongoose = require('mongoose');
const { Schema } = mongoose;

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

const habitSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, trim: true, default: '' },

    frequency: { type: String, enum: FREQUENCIES, default: 'daily' },

    completedDates: {
      type: [String],
      default: [],
    },
    
    isShutdown: {
      type: Boolean,
      default: false,
    },

    lastResetWeek: { type: Number, default: null },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    sheetUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
