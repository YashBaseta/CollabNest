// models/Activity.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, required: true }, // e.g. task_created, status_updated
  details: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Activity", activitySchema);
