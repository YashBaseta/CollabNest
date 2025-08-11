import { Settings, User } from "lucide-react";
import Header from "../../components/common/Header";
import Side from "../../components/common/Sidebar";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure

function Adashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const { projectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  // Task badge state
  const [taskCount, setTaskCount] = useState(0);
  const [newTask, setNewTask] = useState(false);

  // Fetch user
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
        setRole(fetchedUser.role);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const res = await api
.get("/projects");
      setProjects(res.data);

      const foundProject = res.data.find((p) => p._id === projectId);
      if (foundProject) {
        setProjectName(foundProject.name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch tasks and track new ones
  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/project/${projectId}`);

        const currentCount = res.data.length;

        // Show "New" badge if task count increased
        if (currentCount > taskCount) {
          setNewTask(true);
        }
        setTaskCount(currentCount);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();

    const interval = setInterval(fetchTasks, 5000); // poll every 5 seconds
    return () => clearInterval(interval);
  }, [projectId, taskCount]);

  return (
    <div className="flex">
      <div>
        <Side />
      </div>
      <div className="w-full">
        <Header />
        <div className="">
          <div className="bg-gray-200 ">
            <div className="flex justify-between items-center px-8 py-4">
              {/* Left Section */}
              <div>
                <h1 className="text-2xl font-bold text-green-700">
                  {projectName ? projectName : "Loading..."}
                </h1>
                <p className="text-sm text-gray-600">Project Overview</p>

                {/* Navigation Tabs */}
                <ul className="flex gap-6 mt-4">
                  {[
                    { label: "Summary", path: "" },
                    { label: "Tasks", path: "tasks" },
                    { label: "Board", path: "board" },
                    { label: "Timeline", path: "timeline" },
                    { label: "Teams", path: "teams" },
                  ].map(({ label, path }) => {
                    const basePath =
                      role === "admin" ? "/admin/projects" : "/user/projects";
                    const fullPath = `${basePath}/${projectId}/${path}`;

                    return (
                      <li key={label} className="relative">
                        <NavLink
                          to={fullPath}
                          onClick={() => label === "Tasks" && setNewTask(false)} // Clear badge on click
                          className={({ isActive }) =>
                            `text-gray-700 font-medium hover:text-amber-700 hover:underline underline-offset-4 transition-colors ${
                              isActive ? "text-amber-900 font-semibold" : ""
                            }`
                          }
                        >
                          {label}
                          {/* Badge for new tasks */}
                          {label === "Tasks" && newTask && (
                            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center cursor-pointer hover:bg-amber-800 transition">
                  <User className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center cursor-pointer hover:bg-amber-500 transition">
                  <Settings className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="w-full min-h-[300px] md:min-h-[400px] lg:min-h-[400px] max-w-full md:max-w-4xl lg:max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adashboard;
