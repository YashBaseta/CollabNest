const express = require("express");
const router = express.Router();
const authController = require("../controller/auth-controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth-middleware");

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);


router.delete("/users/:id", authController.deleteUser);     // DELETE user
router.patch("/users/:id", authController.updateRole);      // Update role

// Protected Routes
router.get("/admin-data", verifyToken, authorizeRoles("admin"), authController.adminData);

module.exports = router;
