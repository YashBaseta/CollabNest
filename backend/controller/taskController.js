import Task from "../models/Task.js";

// Create a new task in a project
export const createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all tasks for a project
export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "name email")
      .populate("reporter", "name email");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task (status, assignee, etc.)
export const updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignee", "name email")
      .populate("reporter", "name email");

    if (!updated) return res.status(404).json({ msg: "Task not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Task not found" });
    res.status(200).json({ msg: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
