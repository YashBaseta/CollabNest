import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMembers,
  addMember,
  removeMember,
  
} from "../controller/projectController.js";

const router = express.Router();

// Create new project
router.post("/", createProject);

// Get all projects
router.get("/", getProjects);

// Get a single project by ID
router.get("/:id", getProjectById);

// Update project details
router.put("/:id", updateProject);

// Delete project
router.delete("/:id", deleteProject);





router.get("/:projectId/members", getMembers);
router.post("/:projectId/members", addMember);
router.delete("/:projectId/members/:userId", removeMember);


export default router;
