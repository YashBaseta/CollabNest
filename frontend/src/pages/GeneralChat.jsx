import { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../api"; // adjust the path based on your folder structure
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import NewGroupModal from "../components/chat/NewGroupModal";

const socket = io("http://localhost:5000");

export default function GeneralChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chat, setChat] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchConversations = async () => {
    try {
      const res = await api.get(`/conversations/${userId}`);
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    if (userId) fetchConversations();
  }, [userId]);

const handleSelectConversation = async (conv) => {
  setSelectedConversation(conv);

  await api.post(`/chat-messages/${conv._id}/read`, { userId });
  fetchConversations(); // Refresh to reset unread count
};



  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
  conversations={conversations}
  onSelect={handleSelectConversation}
  onCreateGroup={() => setShowModal(true)}
  refreshConversations={fetchConversations}
/>


      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            chat={chat}
            setChat={setChat}
            socket={socket}
            conversation={selectedConversation}
            userId={userId}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation
          </div>
        )}
      </div>

      {showModal && (
        <NewGroupModal
          onClose={() => setShowModal(false)}
          onGroupCreated={fetchConversations}
          userId={userId}
        />
      )}
    </div>
  );
}
