const mongoose = require('mongoose');

const { Schema } = mongoose;

const VALID_STATUSES = ['To Do', 'In Progress', 'Done'];

const kanbanTaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: 'Status must be one of: ' + VALID_STATUSES.join(', '),
      },
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
  },
  {
    timestamps: true,
  }
);

kanbanTaskSchema.path('status').validate(function (value) {
  return VALID_STATUSES.includes(value);
}, 'Invalid status value');

module.exports = mongoose.model('KanbanTask', kanbanTaskSchema);