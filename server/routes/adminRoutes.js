const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Multer config for admin update photo
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Update user (Name, Mobile, Profile Photo)
router.put(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { name, mobile } = req.body;

      // mobile validation
      const mobileRegex = /^[0-9]{10}$/;
      if (mobile && !mobileRegex.test(mobile)) {
        return res
          .status(400)
          .json({ message: "Invalid mobile number (must be 10 digits)" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (mobile) updateData.mobile = mobile;

      // photo update
      if (req.file) {
        updateData.profilePhoto = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).select("-password");

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete user
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
