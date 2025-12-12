const express = require('express');
const router = express.Router();
const bedtimeController = require('../controllers/bedtimeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', bedtimeController.getPlans);
router.post('/', bedtimeController.addPlan);
router.put('/:id', bedtimeController.updatePlan);
router.delete('/:id', bedtimeController.deletePlan);

module.exports = router;
