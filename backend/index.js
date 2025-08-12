import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRouter from "./routes/auth.js"; 
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import messageRoutes from "./routes/chat/messageRoutes.js";
import conversationRoutes from "./routes/chat/conversationRoutes.js";
import chatMessageRoutes from "./routes/chat/chatMessageRoutes.js";
import User from "./models/auth.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173", 
  "https://collabnest-1.onrender.com"
];

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io; 
  next();
});

// Create HTTP + Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ------------------- Routes -------------------
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

  socket.on("joinRoom", (roomId) => socket.join(roomId));

  socket.on("registerRole", (role) => {
    if (role === "admin") socket.join("admins");
  });

  socket.on("taskStatusChanged", ({ task, projectId, role }) => {
    if (role === "user") {
      io.to(projectId).emit("notifyStatusChange", {
        message: `${role} Task "${task.title}" moved to "${task.status}"`,
        task,
      });
    } else {
      io.to("admins").emit("notifyStatusChange", {
        message: `Task "${task.title}" moved to "${task.status}" in Project ${projectId}`,
        task,
      });
    }
  });

  socket.on("sendMessage", (data) => {
    socket.to(data.projectId).emit("receiveMessage", data);
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("sendChatMessage", (message) => {
    socket.to(message.conversation).emit("receiveChatMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
   

// ------------------- CONNECT TO DB & START SERVER -------------------
mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://yash:yash123@cluster0.pkng7vr.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
