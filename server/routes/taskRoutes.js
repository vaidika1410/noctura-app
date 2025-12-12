const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const {
  getTodoTasks,
  createTodoTask,
  updateTodoTask,
  deleteTodoTask,
} = require('../controllers/taskController');

router.use(auth);

router.get('/', getTodoTasks);
router.post('/', createTodoTask);
router.put('/:id', updateTodoTask);
router.delete('/:id', deleteTodoTask);



module.exports = router;