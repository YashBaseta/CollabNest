import express from "express";
import { getMessages, createMessage } from "../../controller/chat/message-controller.js";

const router = express.Router();

router.get("/:projectId", getMessages);  // Fetch all messages for a project
router.post("/:projectId", createMessage);  // Post a new message

export default router;
