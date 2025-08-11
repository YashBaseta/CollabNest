import { useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Chatbox from "./Chatbox";
import { AlignCenter } from "lucide-react";

const socket = io("http://localhost:5000");

function TeamsPage() {
  const { projectId } = useParams();

  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    fetchUsers();
    fetchProjectMembers();

    // Join socket room for this project
    socket.emit("joinRoom", projectId);

    // Listen for updates to team members
    socket.on("teamUpdated", () => {
      fetchProjectMembers(); // Refresh list when backend broadcasts update
    });

    return () => {
      socket.off("teamUpdated");
    };
  }, [projectId]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      console.log(res.data);
      
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`
      );
      setProjectMembers(res.data.members || []);
    } catch (err) {
      console.error("Error fetching project members:", err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return alert("Select a user first");

    try {
      await api.post(`/projects/${projectId}/members`,
        { userId: selectedUser }
      );

      // Broadcast team update via socket
      socket.emit("teamChanged", projectId);
    } catch (err) {
      console.error("Error adding member:", err);
    }
    fetchProjectMembers();
  };
  
  const handleRemoveMember = async (userId) => {
    try {
      await api
.delete(
        `
/projects/${projectId}/members/${userId}`
      );

      // Broadcast team update
      socket.emit("teamChanged", projectId);
    } catch (err) {
      console.error("Error removing member:", err);
    }
    fetchProjectMembers();
  };


const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);





  return (
    <div className="p-8  ">
     

      {/* Add Member */}
      <section className="flex justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Teams
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Select onValueChange={(value) => setSelectedUser(value)}>
            <SelectTrigger className="w-[300px] border border-gray-300 rounded-lg shadow-sm">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name || user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddMember}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
          >
            Add
          </Button>
         <Button onClick={openModal} className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm">Show Members</Button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold text-center mb-6">
              Project Members
            </h2>

            {projectMembers.length === 0 ? (
              <div className="text-gray-500 italic text-center">
                No members yet.
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {projectMembers.map((member) => (
                  <li
                    key={member._id}
                    className="bg-gray-100 border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-lg font-medium text-center">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500 text-center">
                      {member.email}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-4 mx-auto block"
                      onClick={() => handleRemoveMember(member._id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
                    
        </div>
      </section>

    
      

      {/* Chatbox */}
      <div className="mt-10">
        <Chatbox />
      </div>
    </div>
  );
}

export default TeamsPage;
