import { useState } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProjectFormDialog = ({ open, setOpen, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    key: "",
    access: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    try {
      const response = await api.post("/projects", { ...formData, userId });
    } catch (error) {
      console.error(
        "Error submitting project:",
        error.response?.data || error.message
      );
      alert("Failed to create project");
    }
    if (onProjectCreated) {
      onProjectCreated(); // call parent's fetchProjects()
    }
    setFormData({
      userId: "",
      name: "",
      key: "",
      access: "",
      description: "",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button>Add Project</Button>  
      </DialogTrigger> */}

      <DialogContent>
        <DialogHeader>Create Project</DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="access">Access</Label>
            <select
              id="access"
              name="access"
              value={formData.access}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select access level</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
