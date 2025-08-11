import express from "express";
import {
  addComment,
  getCommentsByTask,
  deleteComment
} from "../controller/commentController.js";

const router = express.Router();

// Add comment to a task
router.post("/", addComment);

// Get comments by task ID
router.get("/task/:taskId", getCommentsByTask);

// Delete comment
router.delete("/:id", deleteComment);

export default router;
