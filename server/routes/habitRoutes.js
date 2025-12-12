const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', habitController.getHabits);
router.post('/', habitController.addHabit);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

router.post('/:id/complete', habitController.markCompleted);
router.post('/:id/uncomplete', habitController.unmarkCompleted);

module.exports = router;
