import { useEffect, useState, useContext } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import TaskFormDialog from "@/components/common/taskforms";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";
import CommentFormDialog from "@/components/common/commentForm";
import { SocketContext } from "../../context/SocketProvider";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const STATUSES = ["Backlog", "To Do", "In Progress", "Review", "Done"];

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const { socket } = useContext(SocketContext);
  const { user, setUser } = useContext(AuthContext);
  const { projectId } = useParams();

  useEffect(() => {
    if (!user || !projectId) return;
    socket.emit("joinRoom", projectId);
  }, [projectId, user]);

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await api.get(`/users/${userId}`);
      setUser(res.data); // Store full user object (includes role)
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch tasks
  useEffect(() => {
    api
      .get(`/tasks/project/${projectId}`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  }, [projectId]);

  // Delete Task
  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    try {
      const updatedTask = await api.put(`/tasks/${draggableId}`, {
        status: destination.droppableId,
      });

      setTasks((prev) =>
        prev.map((task) => (task._id === draggableId ? updatedTask.data : task))
      );

      if (user) {
        console.log("Emitting taskStatusChanged:", {
          task: updatedTask.data,
          projectId,
          role: user.role,
        });

        socket.emit("taskStatusChanged", {
          task: updatedTask.data,
          projectId,
          role: user.role,
        });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const statusColorMap = {
    Backlog: "bg-gray-200",
    "To Do": "bg-blue-200",
    "In Progress": "bg-yellow-200",
    Review: "bg-purple-200",
    Done: "bg-green-200",
  };

  return (
    <>
      <CommentFormDialog />
      <TaskFormDialog
        projectId={projectId}
        onTaskCreated={(task) => setTasks((prev) => [...prev, task])}
      />
      <div className="flex gap-4 p-4 bg-gray-100 h-screen">
        <DragDropContext onDragEnd={onDragEnd}>
          {STATUSES.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 bg-white rounded-xl p-4 shadow-md"
                >
                  <h2 className="font-bold text-lg mb-3 text-blue-500">
                    {status}
                  </h2>
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className={`p-3 rounded-lg shadow mb-3 relative ${
                              statusColorMap[task.status]
                            }`}
                          >
                            {/* Delete Icon */}
                            <X
                              height={16}
                              className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(task._id)}
                            />
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-sm text-gray-700">
                              {task.description}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </>
  );
}

export default TaskPage;
