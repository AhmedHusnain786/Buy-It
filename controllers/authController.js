const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

exports.register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: `This email is already registered as ${exists.role}. Please use another email or login.`
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user"
    });

    res.status(201).json({
      message: "User account created successfully.",
      token: makeToken(user),
      user: safeUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered. Please use another email." });
    }
    res.status(500).json({ message: error.message || "Registration failed." });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Account not found. Please register first." });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.json({
      message: "Login successful.",
      token: makeToken(user),
      user: safeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed." });
  }
};