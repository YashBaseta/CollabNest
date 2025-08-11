// models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    name: { type: String },         // For group chats
    isGroup: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
        lastRead: {
    type: Map,
    of: Date, // Store last read timestamp per user
    default: {},
  },
    
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
