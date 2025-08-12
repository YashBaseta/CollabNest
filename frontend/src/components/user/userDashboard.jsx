import Header from "../common/Header";
import Side from "../common/Sidebar";
import { useEffect, useState, useContext } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { Folder, ClipboardList, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketProvider";
import toast from "react-hot-toast";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Always declare context hook at top, before any conditional return
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        // Fetch user
        const userRes = await api.get(`/users/${userId}`);
        setUser(userRes.data);

        // Fetch projects (assigned or created by user)
        const projRes = await api.get("/projects");
        const filteredProjects = projRes.data.filter(
          (project) =>
            project.userId?._id === userId ||
            (project.members || []).some((member) => member._id === userId)
        );
        setProjects(filteredProjects);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("roleUpdated", (data) => {
      toast.success(data.message);
    });

    return () => {
      socket.off("roleUpdated");
    };
  }, [socket]);

  // The conditional return comes *after* hooks
  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="flex">
      <div>
        <Side />
      </div>
      <div className="w-full">
        <Header />
        <div className="p-6 bg-gray-100 min-h-screen">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name || "User"} 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here’s an overview of your projects and tasks.
            </p>
          </div>

          {/* Quick Stats */}
          <div className=" h-90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="h-40 p-4 bg-white rounded-xl shadow flex items-center gap-4">
                <Folder className="w-15 h-15 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-2xl text-gray-500">Projects</p>
                </div>
              </div>
              <div className="h-40 p-4 bg-white rounded-xl shadow flex items-center gap-4">
                <ClipboardList className="w-15 h-15 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-2xl text-gray-500">Tasks</p>
                </div>
              </div>
              <div className="h-40 p-4 bg-white rounded-xl shadow flex items-center gap-4">
                <ClipboardList className="w-15 h-15 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-2xl text-gray-500">Tasks</p>
                </div>
              </div>
              <div className="h-40 p-4 bg-white rounded-xl shadow flex items-center gap-4">
                <Bell className="w-15 h-15 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-2xl text-gray-500">Notifications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            {projects.length === 0 ? (
              <p className="text-gray-500">No projects yet.</p>
            ) : (
              <ul className="divide-y">
                {projects.map((project) => (
                  <li
                    key={project._id}
                    onClick={() => navigate(`/user/projects/${project._id}`)}
                    className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-gray-500 text-sm">
                        Key: {project.key}
                      </p>
                    </div>
                    <span className="text-amber-600 text-sm">View</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate("/user/profile")}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
            >
              <User size={18} /> View Profile
            </button>
            <button
              onClick={() => navigate("/user/tasks")}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
            >
              <ClipboardList size={18} /> Manage Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
