import Message from "../../models/chat/message.js";

export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Populate sender info (name + email for consistency)
    const messages = await Message.find({ project: projectId })
      .populate("sender", "name  email")
      .sort({ createdAt: 1 }); // optional: sort by oldest first

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { senderId, content } = req.body;

    // Save the message
    const newMessage = await Message.create({
      project: projectId,
      sender: senderId,
      content,
    });

    // Populate sender info
    const populatedMessage = await newMessage.populate("sender", "name email");

    // Normalize the payload for frontend
    const messageData = {
      _id: populatedMessage._id,
      content: populatedMessage.content,
      createdAt: populatedMessage.createdAt,
      project: populatedMessage.project,
      sender: populatedMessage.sender, // { name, email }
    };

    
    // Emit to everyone in this project's chat room (including sender)
    req.io.to(projectId).emit("receiveMessage", messageData);

    res.status(201).json(messageData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
