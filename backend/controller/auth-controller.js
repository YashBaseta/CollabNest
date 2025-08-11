const User = require("../models/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Register user
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const newUser = new User({ name, email, password, role, projects:[] });
    await newUser.save();

    res.status(201).json({ msg: "User registered" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  JWT_SECRET="abcdefghi"
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
user.forceLogout = false;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name:user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Login error:", err.message); // <-- Add this
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// Admin-only route example
exports.adminData = (req, res) => {
  res.json({ msg: "This is protected admin content." });
};




exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted successfully", user: deletedUser });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete user", error: err.message });
  }
};

// Update user role (Admin only)
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = role;
    user.forceLogout= true;
    await user.save();

    res.json({ msg: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update role", error: err.message });
  }
};