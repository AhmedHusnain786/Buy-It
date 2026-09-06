require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

(async () => {
  await connectDB();

  const email = "admin@dukanonline.com";
  const password = "Admin@123";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name: "Buy It Admin",
    email,
    password: hashed,
    role: "admin"
  });

  console.log("Admin created");
  console.log("Email:", email);
  console.log("Password:", password);
  process.exit(0);
})();