import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api"; // adjust the path based on your folder structure

export default function ChatSidebar({
  conversations,
  onSelect,
  onCreateGroup,
  refreshConversations,
}) {
  const { user, setUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Load logged-in user (for DMs)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await api.get(`/users/${userId}`);
        const fetchedUser = Array.isArray(res.data)
          ? res.data.find((u) => u._id === userId)
          : res.data;

        if (!fetchedUser) return;
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Search other users
  const searchUsers = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) return setSearchResults([]);

    try {
      const res = await api.get(`/users/search?query=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("User search failed", err);
    }
  };

  // Start a direct message
  const startDM = async (targetUser) => {
    if (!user || !user._id) return;

    try {
      const res = await api.post("/conversations", {
        isGroup: false,
        members: [user._id, targetUser._id],
      });

      await refreshConversations();
      onSelect(res.data);

      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to start DM", err);
    }
  };

  return (
    <div className="w-64 bg-white border-r p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Chats</h2>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={searchUsers}
        className="border rounded px-2 py-1 mb-2"
      />

      {searchResults.length > 0 && (
        <ul className="mb-2 bg-gray-50 rounded shadow">
          {searchResults
            .filter((u) => {
              // Check if there is already a DM with this user
              return !conversations.some(
                (conv) =>
                  !conv.isGroup && conv.members.some((m) => m._id === u._id)
              );
            })
            .map((u) => (
              <li
                key={u._id}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => startDM(u)}
              >
                {u.name} ({u.email})
              </li>
            ))}
        </ul>
      )}

      <ul className="flex-1 overflow-y-auto space-y-2">
        {conversations.map((conv) => {
          if (!user?._id) return null;

          // Deduplicate members (in case API sends duplicates)
          const uniqueMembers = conv.members.filter(
            (m, idx, arr) => arr.findIndex((mem) => mem._id === m._id) === idx
          );

          const otherMembers = uniqueMembers.filter((m) => m._id !== user._id);

          const displayName = conv.isGroup
            ? conv.name
            : otherMembers[0]?.name || "Unknown User";

          return (
            <li
              key={conv._id}
              className={`p-2 rounded cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
                conv.unreadCount > 0 ? "font-bold text-blue-600" : ""
              }`}
              onClick={() => onSelect(conv)}
            >
              {displayName}
              {conv.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                  {conv.unreadCount}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
