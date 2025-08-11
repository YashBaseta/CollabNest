import express from "express";
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask
} from "../controller/taskController.js";

const router = express.Router();

// Create a new task in a project
router.post("/", createTask);

// Get tasks by project ID
router.get("/project/:projectId", getTasksByProject);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

export default router;
