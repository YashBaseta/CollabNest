const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  forceLogout: { type: Boolean, default: false }, // Flag for auto logout
  role: {
    type: String,
    enum: ["user", "admin", "manager"],
    default: "user"
  },  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
},{ timestamps: true });

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 6);
  }
});

module.exports = mongoose.model("User", userSchema);
