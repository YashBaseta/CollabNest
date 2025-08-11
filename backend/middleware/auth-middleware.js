const jwt = require("jsonwebtoken");
const User =require("../models/auth")

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ msg: "User not found" });

    // Force logout check
    if (user.forceLogout) {
      return res.status(401).json({ msg: "Session expired. Please log in again." });
    }

    req.user = user; // Attach full user object (not just JWT payload)
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};
