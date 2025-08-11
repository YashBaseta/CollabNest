import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Backlog", "To Do", "In Progress", "Review", "Done"],
    default: "Backlog",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dueDate: { type: Date },
}, { timestamps: true });

// Cascade delete comments when task is deleted
taskSchema.pre("findOneAndDelete", async function (next) {
  const taskId = this.getQuery()["_id"];
  await mongoose.model("Comment").deleteMany({ task: taskId });
  next();
});

export default mongoose.model("Task", taskSchema);
