// routes/conversationRoutes.js
import express from "express";
import Conversation from "../../models/chat/conversation.js";

const router = express.Router();

// Create DM or group conversation
router.post("/", async (req, res) => {
  try {
    const { isGroup, members, name } = req.body;

    if (!Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: "A conversation must have at least 2 members" });
    }

    const conversation = await Conversation.create({
      isGroup,
      members,
      name: isGroup ? name : null,
    });

    res.json(conversation);
  } catch (error) {
    console.error("Failed to create conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all conversations for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ members: userId })
      .populate("members", "name email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
