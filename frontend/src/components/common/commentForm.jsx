import { useState, useEffect } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router-dom";

export default function CommentFormDialog({ onCommentAdded }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [text, setText] = useState("");
  const { projectId } = useParams();
  // Fetch tasks for selection
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/project/${projectId}`);

        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err.message);
      }
    };
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/comments", {
        task: selectedTask,
        author: localStorage.getItem("userId"),
        text,
      });
      onCommentAdded(res.data);
      setText("");
      setSelectedTask("");
      setOpen(false);
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Floating Button */}
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full w-14 h-14 p-0 flex items-center justify-center bg-amber-600 text-white hover:bg-amber-800"
        >
          +
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Task Selector */}
          <Select onValueChange={setSelectedTask} value={selectedTask}>
            <SelectTrigger>
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task._id} value={task._id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Comment Box */}
          <Textarea
            placeholder="Write your comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <DialogFooter>
            <Button type="submit" disabled={!selectedTask || !text.trim()}>
              Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
