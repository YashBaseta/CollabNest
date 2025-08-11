import express from "express";
import ChatMessage from "../../models/chat/ChatMessage.js";
import Conversation from "../../models/chat/conversation.js";

const router = express.Router();

// Fetch all messages for a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ conversation: req.params.conversationId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message in a conversation
router.post("/:conversationId", async (req, res) => {
   try {
    const { sender, content } = req.body;
    const { conversationId } = req.params;

    let message = await ChatMessage.create({
      conversation: conversationId,
      sender,
      content
    });

    // Populate sender info so the frontend gets name/email immediately
    message = await message.populate("sender", "name email");

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});



router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({ members: userId }).populate("members", "name email");

    // Calculate unread messages for each conversation
    const data = await Promise.all(
      conversations.map(async (conv) => {
        const lastRead = conv.lastRead.get(userId) || new Date(0);
        const unreadCount = await ChatMessage.countDocuments({
          conversation: conv._id,
          createdAt: { $gt: lastRead },
          sender: { $ne: userId }, // Don't count own messages
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json(data);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// routes/conversation.js
router.post("/:conversationId/read", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`lastRead.${userId}`]: new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to mark as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});






export default router;
