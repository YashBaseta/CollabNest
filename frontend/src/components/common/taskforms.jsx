import { useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";

export default function TaskFormDialog({ projectId, onTaskCreated }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Backlog",
    priority: "Medium",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in");
      return;
    }

    try {
      const res = await api.post("/tasks", {
        ...formData,
        project: projectId, // Must be a valid Project ID
        reporter: userId, // Must be valid User ID
      });

      onTaskCreated(res.data);
      setFormData({
        title: "",
        description: "",
        status: "Backlog",
        priority: "Medium",
      });
      setOpen(false);
    } catch (err) {
      console.error("Error creating task:", err.response?.data || err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            style={{ height: "50px" }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
          >
            Add Task
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="border rounded p-2"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
