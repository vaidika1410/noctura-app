
const mongoose = require('mongoose');
const Task = require('../models/Task');
const KanbanTask = require('../models/KanbanTask');

const STATUSES_KANBAN = ['To Do', 'In Progress', 'Done'];
const STATUSES_TODO = ['pending', 'in-progress', 'completed'];

const err = (res, statusCode, message, extra = {}) =>
    res.status(statusCode).json({ success: false, message, ...extra });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function normalizeIncomingDate(val) {
    if (!val) return null;
   
    if (val instanceof Date && !isNaN(val)) {
        const d = new Date(val);
        d.setHours(12, 0, 0, 0);
        return d;
    }

    if (typeof val === 'string') {
        const trimmed = val.trim();

        const simpleDateMatch = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
        if (simpleDateMatch) {
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


function createController(model, config = {}) {
    const {
        userField = 'user', 
        statuses = null, 
        groupByStatus = false, 
        updatableFields = ['title', 'description', 'status'],
    } = config;

    async function get(req, res) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return err(res, 401, 'Unauthorized');

            const filter = {};
            filter[userField] = userId;

            const docs = await model.find(filter).sort({ createdAt: -1 }).lean();

            if (groupByStatus && Array.isArray(statuses)) {
              
                const grouped = statuses.reduce((acc, s) => {
                    acc[s] = [];
                    return acc;
                }, {});
                for (const d of docs) {
                    const st = d.status && statuses.includes(d.status) ? d.status : statuses[0];
                    grouped[st].push(d);
                }
                return res.json({ success: true, data: grouped });
            }

            return res.json({ success: true, data: docs });
        } catch (error) {
            console.error('[TASK] get error:', error && error.stack ? error.stack : error);
            return err(res, 500, 'Server error');
        }
    }


    async function add(req, res) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return err(res, 401, 'Unauthorized');

            const body = req.body || {};
            const title = body.title && String(body.title).trim();
            if (!title) return err(res, 400, 'title is required');

            if (typeof body.status !== 'undefined' && statuses && !statuses.includes(body.status)) {
                return err(res, 400, `status must be one of: ${statuses.join(', ')}`);
            }

            const docData = {};
            docData[userField] = userId;
            docData.title = title;

            if (typeof body.description !== 'undefined') {
                docData.description = body.description === null ? '' : String(body.description).trim();
            }

            if (typeof body.status !== 'undefined') {
                docData.status = body.status;
            }

            
            for (const f of updatableFields) {
                if (['title', 'description', 'status'].includes(f)) continue;
                if (typeof body[f] !== 'undefined') {
                    
                    if (f === 'dueDate') {
                        const normalized = normalizeIncomingDate(body[f]);
                        if (normalized) docData[f] = normalized;
                        
                    } else {
                        docData[f] = body[f];
                    }
                }
            }

            const doc = new model(docData);
            await doc.save();
            return res.status(201).json({ success: true, data: doc });
        } catch (error) {
            console.error('[TASK] add error:', error && error.stack ? error.stack : error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map((e) => e.message).join('; ');
                return err(res, 400, `Validation error: ${messages}`);
            }
            return err(res, 500, 'Server error');
        }
    }
 
    async function update(req, res) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return err(res, 401, 'Unauthorized');

            const { id } = req.params;
            if (!isValidId(id)) return err(res, 400, 'invalid task id');

            const doc = await model.findById(id);
            if (!doc) return err(res, 404, 'Task not found');

            if (String(doc[userField]) !== String(userId)) return err(res, 403, 'Forbidden');

            const body = req.body || {};

            if (typeof body.title !== 'undefined') {
                const t = String(body.title).trim();
                if (!t) return err(res, 400, 'title cannot be empty');
                doc.title = t;
            }

            if (typeof body.description !== 'undefined') {
                doc.description = body.description === null ? '' : String(body.description).trim();
            }

            if (typeof body.status !== 'undefined') {
                if (statuses && !statuses.includes(body.status)) {
                    return err(res, 400, `status must be one of: ${statuses.join(', ')}`);
                }
                doc.status = body.status;
            }

   
            for (const f of updatableFields) {
                if (['title', 'description', 'status'].includes(f)) continue;
                if (typeof body[f] !== 'undefined') {
                    if (f === 'dueDate') {
                        const normalized = normalizeIncomingDate(body[f]);
                        if (normalized) doc[f] = normalized;
                        else doc[f] = null;
                    } else {
                        doc[f] = body[f];
                    }
                }
            }

            await doc.save();
            return res.json({ success: true, data: doc });
        } catch (error) {
            console.error('[TASK] update error:', error && error.stack ? error.stack : error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map((e) => e.message).join('; ');
                return err(res, 400, `Validation error: ${messages}`);
            }
            return err(res, 500, 'Server error');
        }
    }


    async function move(req, res) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return err(res, 401, 'Unauthorized');

            const { id } = req.params;
            const { newStatus } = req.body || {};

            if (!isValidId(id)) return err(res, 400, 'invalid task id');
            if (!newStatus || (statuses && !statuses.includes(newStatus))) {
                return err(res, 400, `newStatus is required and must be one of: ${statuses ? statuses.join(', ') : 'N/A'}`);
            }

            const doc = await model.findById(id);
            if (!doc) return err(res, 404, 'Task not found');
            if (String(doc[userField]) !== String(userId)) return err(res, 403, 'Forbidden');

            doc.status = newStatus;
            await doc.save();
            return res.json({ success: true, data: doc });
        } catch (error) {
            console.error('[TASK] move error:', error && error.stack ? error.stack : error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map((e) => e.message).join('; ');
                return err(res, 400, `Validation error: ${messages}`);
            }
            return err(res, 500, 'Server error');
        }
    }

    async function remove(req, res) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return err(res, 401, 'Unauthorized');

            const { id } = req.params;
            if (!isValidId(id)) return err(res, 400, 'invalid task id');

            const doc = await model.findById(id);
            if (!doc) return err(res, 404, 'Task not found');
            if (String(doc[userField]) !== String(userId)) return err(res, 403, 'Forbidden');

            await doc.deleteOne();
            return res.json({ success: true, data: { message: 'Task deleted' } });
        } catch (error) {
            console.error('[TASK] remove error:', error && error.stack ? error.stack : error);
            return err(res, 500, 'Server error');
        }
    }

    async function batchUpdate(req, res) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return err(res, 401, 'Unauthorized');

            const items = Array.isArray(req.body && req.body.tasks) ? req.body.tasks : null;
            if (!items || items.length === 0) return err(res, 400, 'tasks array is required');


            console.log('Batch update body:', req.body);

            const updatesMap = new Map();
            for (const it of items) {

                console.log('Processing task:', it);

                const taskId = it.id || it._id;
                if (!taskId) return err(res, 400, 'each task must include a valid _id');
                const idStr = String(taskId);
                if (!isValidId(idStr)) return err(res, 400, `invalid task id: ${idStr}`);
                if (!it.newStatus || (statuses && !statuses.includes(it.newStatus))) {
                    return err(res, 400, `newStatus must be one of: ${statuses ? statuses.join(', ') : 'N/A'}`);
                }
                updatesMap.set(idStr, it.newStatus);
            }


            const ids = Array.from(updatesMap.keys());
            const objectIds = ids.map((id) => mongoose.Types.ObjectId(id));
            const docs = await model.find({ _id: { $in: objectIds } }).lean();

            if (docs.length !== ids.length) {
                const found = new Set(docs.map((d) => d._id.toString()));
                const missing = ids.filter((i) => !found.has(i));
                return res.status(404).json({ success: false, message: 'Some tasks not found', missing });
            }

            for (const d of docs) {
                if (String(d[userField]) !== String(userId)) {
                    return err(res, 403, 'Forbidden: one or more tasks do not belong to the user');
                }
            }

            const bulkOps = [];
            for (const [id, newStatus] of updatesMap.entries()) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: mongoose.Types.ObjectId(id) },
                        update: { $set: { status: newStatus } },
                    },
                });
            }

            if (bulkOps.length > 0) {
                await model.bulkWrite(bulkOps);
            }

            const updated = await model.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
            return res.json({ success: true, data: updated });
        } catch (error) {
            console.error('[TASK] batchUpdate error:', error && error.stack ? error.stack : error);
            return err(res, 500, 'Server error');
        }
    }

    return {
        get,
        add,
        update,
        move,
        remove,
        batchUpdate,
    };
}


const todoController = createController(Task, {
    userField: 'user',
    statuses: STATUSES_TODO,
    groupByStatus: false,
    updatableFields: ['title', 'description', 'status', 'dueDate', 'priority'],
});


const kanbanController = createController(KanbanTask, {
    userField: 'userId',
    statuses: STATUSES_KANBAN,
    groupByStatus: true,
    updatableFields: ['title', 'description', 'status', 'priority'],
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
