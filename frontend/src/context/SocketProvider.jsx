import { createContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

export const SocketContext = createContext();

// Create a single socket instance (singleton)
const socket = io("https://collabnest-m2h3.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

export default function SocketProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadTasks, setUnreadTasks] = useState(0);
  const originalTitle = useRef(document.title);
  const userIdRef = useRef(localStorage.getItem("userId") || null);

  // --- Reset functions for badges ---
  const resetUnreadChat = () => setUnreadChat(0);
  const resetUnreadTasks = () => setUnreadTasks(0);

  // --- Listen for task change notifications globally ---
  useEffect(() => {
    const handleTaskNotification = ({ message }) => {
      toast.success(message);
      console.log("Task Notification:", message);

      // Change page title briefly
      document.title = "🔔 Task Updated!";
      setTimeout(() => (document.title = originalTitle.current), 2000);

      // Save to notifications
      setNotifications((prev) => [...prev, { type: "task", message }]);

      // Increment task badge
      setUnreadTasks((prev) => prev + 1);
    };

    socket.on("notifyStatusChange", handleTaskNotification);

    return () => {
      socket.off("notifyStatusChange", handleTaskNotification);
    };
  }, []);

  // --- Handle global chat messages ---
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (msg.sender?._id === userIdRef.current) return;

      // Play notification sound
      const playSound = async () => {
        try {
          const audio = new Audio("/preview.mp3");
          audio.volume = 1.0;
          await audio.play();
        } catch {
          document.addEventListener(
            "click",
            () => new Audio("/preview.mp3").play(),
            { once: true }
          );
        }
      };
      playSound();

      // Show toast & change title
      toast.success(`New message from ${msg.sender?.name || "Someone"}`);
      document.title = "🔔 New Message!";
      setTimeout(() => (document.title = originalTitle.current), 2000);

      // Save to notifications
      setNotifications((prev) => [...prev, { type: "chat", ...msg }]);

      // Increment chat badge
      setUnreadChat((prev) => prev + 1);

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification(`New message from ${msg.sender?.name || "Someone"}`, {
          body: msg.content,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        unreadChat,
        unreadTasks,
        resetUnreadChat,
        resetUnreadTasks,
      }}
    >
      <Toaster position="top-right" />
      {children}
    </SocketContext.Provider>
  );
}
