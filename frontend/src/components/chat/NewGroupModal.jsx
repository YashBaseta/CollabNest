import { useContext, useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { AuthContext } from "../../context/AuthContext";

export default function NewGroupModal({ onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const { user, setUser } = useContext(AuthContext);

  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      await api.post("/conversations", {
        isGroup: true,
        name: groupName,
        members: [user._id], // Add creator by default (add others later)
        createdBy: user._id,
      });
      onGroupCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Create Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          className="w-full border px-3 py-2 mb-4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={createGroup}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
