import { useEffect, useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { useParams } from "react-router-dom";

function BoardPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [t, sT] = useState("");

  const { projectId } = useParams();
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/project/${projectId}`);
        const task = res.data;
        sT(task);

        const taskIds = res.data.map((task) => task._id);
        setTasks(taskIds);

        // Fetch comments for the first task automatically
        if (taskIds.length > 0) {
          fetchComments(taskIds[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err.message);
        setError("Failed to load tasks");
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const fetchComments = async (taskId) => {
    try {
      const res = await api.get(`/comments/task/${taskId}`);
      setComments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading comments...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment._id}
              className="p-4 bg-white rounded-lg shadow border"
            >
              <p className="text-gray-800">{comment.text}</p>
              <p className="text-sm text-gray-500 mt-1">
                By: {comment.author?.name || "Unknown"} | Task:{" "}
                {t.map((item) => item.title) || "Deleted Task"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BoardPage;
