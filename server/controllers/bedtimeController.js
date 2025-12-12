const mongoose = require('mongoose');
const BedtimePlanner = require('../models/BedtimePlanner');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const err = (res, statusCode, message, extra = {}) =>
  res.status(statusCode).json({ success: false, message, ...extra });

const bedtimeController = {
  // GET all night tasks
  async getPlans(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const plans = await BedtimePlanner.find({ userId })
        .sort({ time: 1 }) 
        .lean();
      return res.json({ success: true, data: plans });
    } catch (error) {
      console.error('[BEDTIME] getPlans error:', error);
      return err(res, 500, 'Server error');
    }
  },

  // ADD new night task
  async addPlan(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const { title, description = '', time } = req.body;

      if (!title?.trim()) return err(res, 400, 'title is required');
      if (!time) return err(res, 400, 'time is required');

      const plan = new BedtimePlanner({
        title: title.trim(),
        description,
        time,
        userId,
      });

      await plan.save();
      return res.status(201).json({ success: true, data: plan });
    } catch (error) {
      console.error('[BEDTIME] addPlan error:', error);
      return err(res, 500, 'Server error');
    }
  },

  // UPDATE plan
  async updatePlan(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const { id } = req.params;
      if (!isValidId(id)) return err(res, 400, 'invalid plan id');

      const plan = await BedtimePlanner.findById(id);
      if (!plan) return err(res, 404, 'Plan not found');
      if (String(plan.userId) !== String(userId)) return err(res, 403, 'Forbidden');

      const { title, description, time } = req.body;
      if (title !== undefined) plan.title = title.trim() || plan.title;
      if (description !== undefined) plan.description = description;
      if (time !== undefined) plan.time = time;

      await plan.save();
      return res.json({ success: true, data: plan });
    } catch (error) {
      console.error('[BEDTIME] updatePlan error:', error);
      return err(res, 500, 'Server error');
    }
  },

  // DELETE plan
  async deletePlan(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return err(res, 401, 'Unauthorized');

      const { id } = req.params;
      if (!isValidId(id)) return err(res, 400, 'invalid plan id');

      const plan = await BedtimePlanner.findById(id);
      if (!plan) return err(res, 404, 'Plan not found');
      if (String(plan.userId) !== String(userId)) return err(res, 403, 'Forbidden');

      await plan.deleteOne();
      return res.json({ success: true, data: { message: 'Plan deleted' } });
    } catch (error) {
      console.error('[BEDTIME] deletePlan error:', error);
      return err(res, 500, 'Server error');
    }
  },
};

module.exports = bedtimeController;
