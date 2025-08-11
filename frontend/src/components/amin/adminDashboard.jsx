import { Eye, Pencil, Trash2, View } from "lucide-react";
import Header from "../common/Header";
import Side from "../common/Sidebar";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"; // ShadCN UI Select
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { useContext } from "react";
import { SocketContext } from "../../context/SocketProvider";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
const loggedInUserId = localStorage.getItem("userId");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);


  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      setMessage("User deleted successfully!");
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    }
  };

  

  // View user (navigate to view page)
  const handleView = (id) => {
    navigate(`/admin/users/${id}`);
  };

  const { socket } = useContext(SocketContext);

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}`, { role: newRole });

      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, role: newRole } : user
        )
      );

      // Notify the user about role change
      if (socket) {
        socket.emit("notifyRoleChange", { userId: id, role: newRole });
      }

      setMessage("Role updated successfully!");
    } catch (err) {
      setError("Failed to update role");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 mt-4">{error}</p>;

  return (
    <div className="flex">
      <div>
        <Side />
      </div>
      <div className="w-full">
        <Header />
        <div className="bg-amber-900">
          <div className="bg-amber-600 w-full">
            <div className="p-6 bg-gray-50 min-h-screen">
              <h2 className="text-2xl font-bold mb-4">All Users</h2>

              {message && (
                <p className="mb-4 text-green-600 font-medium">{message}</p>
              )}

              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-m text-left text-gray-700">
                  <thead className="bg-gray-200 text-gray-900">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr
                        key={user._id}
                        className="border-b hover:bg-gray-100 transition"
                      >
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2 capitalize">
                          <Select
  onValueChange={(value) => handleRoleChange(user._id, value)}
  defaultValue={user.role}
  disabled={user._id === loggedInUserId} // Disable for current user
>
  <SelectTrigger className="w-[120px]">
    <SelectValue placeholder="Select Role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="user">User</SelectItem>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="manager">Manager</SelectItem>
  </SelectContent>
</Select>

                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                          className="border-2"
                            variant="primary"
                            size="sm"
                             onClick={() => handleView(user._id)} 
                          >
                            <View className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
