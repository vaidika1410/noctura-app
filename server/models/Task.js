const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['backlog', 'pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

  },
  {
    timestamps: true,
  }
);

const KANBAN_MAP = {
  pending: "To Do",
  "in-progress": "In Progress",
  completed: "Done",
};


module.exports = mongoose.model('Task', taskSchema);