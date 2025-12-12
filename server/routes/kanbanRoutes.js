const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getTodoTasks,
  createTodoTask,
  updateTodoTask,
  deleteTodoTask,
  batchUpdateTasks,
  updateTodoTask: moveTask
} = require("../controllers/taskController");

router.use(auth);


router.get("/tasks", getTodoTasks);            
router.post("/tasks", createTodoTask);         
router.put("/tasks/:id", updateTodoTask);      
router.put("/tasks/:id/move", moveTask);       
router.delete("/tasks/:id", deleteTodoTask);   
router.put("/tasks/batch", batchUpdateTasks);  

module.exports = router;
