import Comment from "../models/Comment.js";

// Add a comment to a task
export const addComment = async (req, res) => {
  try {
    const newComment = await Comment.create(req.body);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all comments for a task
export const getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Comment not found" });
    res.status(200).json({ msg: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
