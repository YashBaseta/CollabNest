import Project from "../models/Project.js";
import User from "../models/auth.js"
import mongoose from "mongoose";

// Create a new project
export const createProject = async (req, res) => {
  try {
    let { userId, name, key, access, description, members } = req.body;

    // Auto-generate key if not provided
    if (!key) {
      key = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 100);
    }

    // Validate access
    const allowedAccess = ['Public', 'Private', 'Restricted'];
    if (access && !allowedAccess.includes(access)) {
      return res.status(400).json({ error: "Access must be Public, Private, or Restricted" });
    }

    // Ensure members are ObjectIds if provided
    if (members && members.length > 0) {
      members = members.map((id) => new mongoose.Types.ObjectId(id));
    }

    const newProject = await Project.create({
    userId,
      name,
      key,
      access,
      description,
      members
    });

    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all projects (populate members)
// controllers/projectController.js
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("userId", "name email") // Creator info
      .populate("members", "name email"); // Team members info

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get a single project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email")
      .populate("userId", "name email");

    if (!project) return res.status(404).json({ msg: "Project not found" });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update project details
export const updateProject = async (req, res) => {
  try {
    const { access } = req.body;
    const allowedAccess = ['Public', 'Private', 'Restricted'];

    if (access && !allowedAccess.includes(access)) {
      return res.status(400).json({ error: "Access must be Public, Private, or Restricted" });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("members", "name email role");

    if (!updated) return res.status(404).json({ msg: "Project not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Project not found" });
    res.status(200).json({ msg: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// --- MEMBERS CRUD (NEW) ---

// Add a member
export const addMember = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    res.json({ msg: "Member added", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a member
export const removeMember = async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    project.members = project.members.filter((id) => id.toString() !== userId);
    await project.save();
    const populated = await project.populate("members", "name email");

    res.status(200).json({ msg: "Member removed", project: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all members
export const getMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("members", "name email");
    if (!project) return res.status(404).json({ msg: "Project not found" });
    res.status(200).json(project.members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};