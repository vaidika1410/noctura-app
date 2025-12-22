const mongoose = require('mongoose');
const Task = require('../models/Task');
const KanbanTask = require('../models/KanbanTask');

const STATUSES_KANBAN = ['To Do', 'In Progress', 'Done'];
const STATUSES_TODO = ['pending', 'in-progress', 'completed'];

const err = (res, statusCode, message, extra = {}) =>
  res.status(statusCode).json({ success: false, message, ...extra });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ------------------ DATE NORMALIZER ------------------ */
function normalizeIncomingDate(val) {
  if (!val) return null;

  if (val instanceof Date && !isNaN(val)) {
    const d = new Date(val);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed)) {
      parsed.setHours(12, 0, 0, 0);
      return parsed;
    }
  }

  return null;
}

/* ------------------ GENERIC CONTROLLER ------------------ */
function createController(model, config = {}) {
  const {
    userField = 'user',
    statuses = null,
    groupByStatus = false,
    updatableFields = [],
  } = config;

  /* ------------------ GET ------------------ */
  async function get(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const filter = { [userField]: userId };
      const docs = await model.find(filter).sort({ createdAt: -1 }).lean();

      if (groupByStatus && Array.isArray(statuses)) {
        const grouped = {};
        statuses.forEach((s) => (grouped[s] = []));
        docs.forEach((d) => {
          const st = statuses.includes(d.status) ? d.status : statuses[0];
          grouped[st].push(d);
        });
        return res.json({ success: true, data: grouped });
      }

      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error('[TASK] get error:', error);
      return err(res, 500, 'Server error');
    }
  }

  /* ------------------ ADD ------------------ */
  async function add(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const body = req.body || {};
      const title = body.title?.trim();
      if (!title) return err(res, 400, 'title is required');

      const docData = {
        [userField]: userId,
        title,
      };

      if (body.description !== undefined) {
        docData.description = body.description?.trim() || '';
      }

      if (body.status !== undefined) {
        if (statuses && !statuses.includes(body.status)) {
          return err(res, 400, `status must be one of: ${statuses.join(', ')}`);
        }
        docData.status = body.status;
      }

      /* 🔑 FIX: priority explicitly preserved */
      if (body.priority !== undefined && body.priority !== null) {
        docData.priority = body.priority;
      }

      if (body.dueDate !== undefined) {
        docData.dueDate = normalizeIncomingDate(body.dueDate);
      }

      const doc = new model(docData);
      await doc.save();

      return res.status(201).json({ success: true, data: doc });
    } catch (error) {
      console.error('[TASK] add error:', error);
      if (error.name === 'ValidationError') {
        const msg = Object.values(error.errors).map((e) => e.message).join('; ');
        return err(res, 400, msg);
      }
      return err(res, 500, 'Server error');
    }
  }

  /* ------------------ UPDATE ------------------ */
  async function update(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const { id } = req.params;
      if (!isValidId(id)) return err(res, 400, 'Invalid task id');

      const doc = await model.findById(id);
      if (!doc) return err(res, 404, 'Task not found');
      if (String(doc[userField]) !== String(userId)) return err(res, 403, 'Forbidden');

      const body = req.body || {};

      if (body.title !== undefined) {
        const t = body.title.trim();
        if (!t) return err(res, 400, 'title cannot be empty');
        doc.title = t;
      }

      if (body.description !== undefined) {
        doc.description = body.description?.trim() || '';
      }

      if (body.status !== undefined) {
        if (statuses && !statuses.includes(body.status)) {
          return err(res, 400, `status must be one of: ${statuses.join(', ')}`);
        }
        doc.status = body.status;
      }

      /* 🔑 FIX: priority updated ONLY when provided */
      if (body.priority !== undefined && body.priority !== null) {
        doc.priority = body.priority;
      }

      if (body.dueDate !== undefined) {
        doc.dueDate = normalizeIncomingDate(body.dueDate);
      }

      await doc.save();
      return res.json({ success: true, data: doc });
    } catch (error) {
      console.error('[TASK] update error:', error);
      return err(res, 500, 'Server error');
    }
  }

  /* ------------------ MOVE (status only, priority untouched) ------------------ */
  async function move(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const { id } = req.params;
      const { newStatus } = req.body;

      if (!isValidId(id)) return err(res, 400, 'Invalid task id');
      if (!newStatus || (statuses && !statuses.includes(newStatus))) {
        return err(res, 400, `newStatus must be one of: ${statuses.join(', ')}`);
      }

      const doc = await model.findById(id);
      if (!doc) return err(res, 404, 'Task not found');
      if (String(doc[userField]) !== String(userId)) return err(res, 403, 'Forbidden');

      doc.status = newStatus;
      await doc.save();

      return res.json({ success: true, data: doc });
    } catch (error) {
      console.error('[TASK] move error:', error);
      return err(res, 500, 'Server error');
    }
  }

  async function remove(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const { id } = req.params;
      if (!isValidId(id)) return err(res, 400, 'Invalid task id');

      const doc = await model.findById(id);
      if (!doc) return err(res, 404, 'Task not found');
      if (String(doc[userField]) !== String(userId)) return err(res, 403, 'Forbidden');

      await doc.deleteOne();
      return res.json({ success: true });
    } catch (error) {
      console.error('[TASK] remove error:', error);
      return err(res, 500, 'Server error');
    }
  }

  async function batchUpdate(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const items = req.body?.tasks;
      if (!Array.isArray(items) || items.length === 0) {
        return err(res, 400, 'tasks array required');
      }

      const bulkOps = [];

      for (const it of items) {
        const id = it.id || it._id;
        if (!isValidId(id)) continue;

        if (!statuses.includes(it.newStatus)) continue;

        bulkOps.push({
          updateOne: {
            filter: { _id: id },
            update: { $set: { status: it.newStatus } },
          },
        });
      }

      if (bulkOps.length) {
        await model.bulkWrite(bulkOps);
      }

      const updated = await model.find({ [userField]: userId });
      return res.json({ success: true, data: updated });
    } catch (error) {
      console.error('[TASK] batchUpdate error:', error);
      return err(res, 500, 'Server error');
    }
  }

  return { get, add, update, move, remove, batchUpdate };
}

/* ------------------ EXPORTS ------------------ */
const todoController = createController(Task, {
  userField: 'user',
  statuses: STATUSES_TODO,
});

const kanbanController = createController(KanbanTask, {
  userField: 'userId',
  statuses: STATUSES_KANBAN,
  groupByStatus: true,
});


module.exports = {
  getTodoTasks: todoController.get,
  createTodoTask: todoController.add,
  updateTodoTask: todoController.update,
  deleteTodoTask: todoController.remove,

  getTasks: kanbanController.get,
  addTask: kanbanController.add,
  updateTask: kanbanController.update,
  moveTask: kanbanController.move,
  deleteTask: kanbanController.remove,
  batchUpdateTasks: kanbanController.batchUpdate,
};
