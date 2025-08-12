import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { Folder } from "lucide-react";
import TaskFormDialog from "../common/taskforms";

const iconMap = {
  HR: Folder,
  DEV: Folder,
};

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const fetchProjects = async (targetUserId, role) => {
    try {
      const res = await api
.get("/projects");
      const filteredProjects = res.data.filter(
        (project) =>
          project.userId?._id === targetUserId ||
          (project.members || []).some((member) => member._id === targetUserId)
      );

      const projectsWithExtras = filteredProjects.map((project) => ({
        ...project,
        url:
          role === "admin"
            ? `/admin/projects/${project._id}`
            : `/user/projects/${project._id}`,
        icon: iconMap[project.key] || Folder,
      }));

      setProjects(projectsWithExtras);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Could not load projects");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api
.get(`
/users/${id}`);
        setUser(userRes.data);
        await fetchProjects(id, userRes.data.role);
      } catch (err) {
        setError("Failed to fetch user or projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  const handleTaskCreated = (task) => {
  
    setShowPopup(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mt-4 mb-4">User Details</h2>

      {user && (
        <div className="bg-white shadow rounded-lg p-4 mb-6 flex justify-between">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-3">Projects for this User</h3>
      {projects.length === 0 ? (
        <p>No projects assigned or created by this user.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project._id}
              onClick={() => {
                setSelectedProjectId(project._id);
                setShowPopup(true);
              }}
              className="p-4 bg-white rounded-lg shadow border cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <project.icon className="w-5 h-5 text-gray-700" />
                <div>
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-gray-500">Key: {project.key}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Show TaskFormDialog only when popup is open */}
      {showPopup && selectedProjectId && (
        <TaskFormDialog
          projectId={selectedProjectId}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}

export default UserDetails;
