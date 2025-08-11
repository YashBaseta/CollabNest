import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true, uppercase: true },
  access: { type: String, enum: ['Public', 'Private', 'Restricted'], default: 'Private' },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Cascade delete tasks and comments when project is deleted
projectSchema.pre("findOneAndDelete", async function (next) {
  const projectId = this.getQuery()["_id"];
  await mongoose.model("Task").deleteMany({ project: projectId });
  await mongoose.model("Comment").deleteMany({ task: { $in: await mongoose.model("Task").find({ project: projectId }).distinct("_id") } });
  next();
});

export default mongoose.model("Project", projectSchema);
