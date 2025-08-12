import { useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure

export default function ChatWindow({
  chat,
  setChat,
  socket,
  conversation,
  userId,
}) {
  const [message, setMessage] = useState("");

  // Fetch messages when opening a conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) return;
      try {
        const res = await api.get(`/chat-messages/${conversation._id}`);
        setChat(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();
  }, [conversation]);

  // Join socket room and listen for new messages
  useEffect(() => {
    if (!conversation?._id) return;

    socket.emit("joinConversation", conversation._id);

    const handleReceive = (newMsg) => {
      setChat((prev) => [...prev, newMsg]);
    };

    socket.on("receiveChatMessage", handleReceive);
    return () => socket.off("receiveChatMessage", handleReceive);
  }, [conversation, socket]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await api.post(`/chat-messages/${conversation._id}`, {
        sender: userId, // Send only string ID
        content: message,
      });

      const newMsg = res.data;
      setChat((prev) => [...prev, newMsg]);
      socket.emit("sendChatMessage", newMsg);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        {chat.map((msg) => {
          const senderId = msg.sender._id ? msg.sender._id : msg.sender;
          const isOwn = senderId === userId;

          return (
            <div
              key={msg._id}
              className={`mb-2 ${isOwn ? "text-right" : "text-left"}`}
            >
              <span className="inline-block bg-gray-200 p-2 rounded whitespace-pre-wrap">
                {msg.sender.name ? `${msg.sender.name}: ` : ""}
                {msg.content}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t flex">
        <textarea
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
