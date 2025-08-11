import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
// Routes
import authRouter from "./routes/auth.js"; 
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import messageRoutes from "./routes/chat/messageRoutes.js";
import conversationRoutes from "./routes/chat/conversationRoutes.js";
import chatMessageRoutes from "./routes/chat/chatMessageRoutes.js";
import User from "./models/auth.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://collabnest-1.onrender.com" // your deployed frontend
];
// Create HTTP + Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io; // Optional: allows emitting events from routes
  next();
});

// Routes to fetch users
app.get("/api/users/search", async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("_id name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to search users" });
  }
});

app.get("/api/users/", async (req, res) => {
  try {
    const users = await User.find().select("_id name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Register main routes
app.use("/api", authRouter);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat-messages", chatMessageRoutes);

// ------------------- SOCKET.IO LOGIC -------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a project room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined project room ${roomId}`);
  });

  // Register role (Admins join a global "admins" room)
  socket.on("registerRole", (role) => {
    if (role === "admin") {
      socket.join("admins");
      console.log(`Admin ${socket.id} joined global admins room`);
    }
  });

socket.on("taskStatusChanged", ({task, projectId, role }) => {
  if (role === "user") {
    // Admin changed the task → notify users in the project
    io.to(projectId).emit("notifyStatusChange", {
      message: `${role} Task "${task.title}" moved to "${task.status}"`,
      task,
    });
  } else {
    // User changed the task → notify all admins
    io.to("admins").emit("notifyStatusChange", {
      message: `Task "${task.title}" moved to "${task.status}" in Project ${projectId}`,
      task,
    });
  }
});

  // Project-based chat
  socket.on("sendMessage", (data) => {
    console.log("New project message:", data);
    socket.to(data.projectId).emit("receiveMessage", data);
  });

  // Conversation (Direct/Group Chat)
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("sendChatMessage", (message) => {
    console.log("New conversation message:", message);
    socket.to(message.conversation).emit("receiveChatMessage", message);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));   