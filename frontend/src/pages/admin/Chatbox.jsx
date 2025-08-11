import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/SocketProvider";
import api from "../../api"; // adjust the path based on your folder structure
import { useParams } from "react-router-dom";

export default function Chatbox() {
  const { projectId } = useParams();
  const { socket } = useContext(SocketContext); // use global socket
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  const user = {
    id: localStorage.getItem("userId") || "anon",
    email: localStorage.getItem("email") || "guest@example.com",
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${projectId}`);
      setChat(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageData = { senderId: user.id, content: message };
    try {
      const res = await api.post(`/messages/${projectId}`,
        messageData
      );
      const savedMessage = res.data;
      socket.emit("sendMessage", { ...savedMessage, projectId });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err.response?.data || err);
    }
  };

  useEffect(() => {
  fetchMessages();
  socket.emit("joinRoom", projectId);

  const handleMessage = (msg) => {
    // Just update the chat, no notifications here
    setChat((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  };

  socket.on("receiveMessage", handleMessage);

  return () => {
    socket.off("receiveMessage", handleMessage);
  };
}, [projectId, socket]);


  useEffect(scrollToBottom, [chat]);

  return (
<div className="p-4 bg-gray-50 rounded-lg shadow-md w-full max-w-5xl flex flex-col h-[80vh] sm:h-[500px] border border-gray-200 mx-auto">
      <h2 className="text-lg font-bold mb-3 text-center text-gray-700">Project Chat</h2>
      <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-white rounded-md border">
        {chat.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet...</p>
        ) : (
          chat.map((msg, idx) => {
            const isSelf = msg.sender?._id === user.id;
            const timestamp = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg._id || idx}
                className={`flex flex-col ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl shadow text-sm ${
                    isSelf
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {!isSelf && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.sender?.name || "Unknown"}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <p className="text-[10px] text-gray-800 mt-1">{timestamp}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef}></div>
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
