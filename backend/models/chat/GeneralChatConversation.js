import mongoose from "mongoose";

const ChatconversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("ChatConversation", ChatconversationSchema);
