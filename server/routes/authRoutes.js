const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const router = express.Router();

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

//Register API
router.post("/register", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json({ message: "User Registered", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login Success", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put("/me", authMiddleware, upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, mobile } = req.body;

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (mobile && !mobileRegex.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number (must be 10 digits)" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;

    if (req.file) {
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
