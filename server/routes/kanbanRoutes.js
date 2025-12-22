const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { addKanbanComment, editComment, deleteComment } = require("../controllers/kanbanController");

router.use(auth);

router.post("/tasks/:id/comments", addKanbanComment);
router.put("/tasks/:id/comments/:commentId", editComment);
router.delete("/tasks/:id/comments/:commentId", deleteComment);


module.exports = router;
