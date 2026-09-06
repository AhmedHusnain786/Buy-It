require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.json({ message: "Buy It API is running" }));
app.get("/api/health", (req, res) => res.json({ ok: true, message: "Backend connected" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Authenticate every Socket.IO connection with the same JWT used by the REST API.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Chat connected: ${socket.user.name} (${socket.id})`);

  socket.emit("chat:system", {
    id: `system-${Date.now()}`,
    text: `Hi ${socket.user.name}! Welcome to Buy It support. How can we help you?`,
    sender: "server",
    createdAt: new Date().toISOString()
  });

  socket.on("chat:message", (payload) => {
    const text = String(payload?.text || "").trim();
    if (!text) return;

    const userMessage = {
      id: `user-${Date.now()}-${socket.id}`,
      text,
      sender: "client",
      userId: socket.user.id,
      createdAt: new Date().toISOString()
    };

    // Send the client's message back through Socket.IO so the server is
    // explicitly involved in the conversation flow.
    socket.emit("chat:message", userMessage);

    const response = getServerResponse(text);
    setTimeout(() => {
      socket.emit("chat:response", {
        id: `server-${Date.now()}-${socket.id}`,
        text: response,
        sender: "server",
        createdAt: new Date().toISOString()
      });
    }, 500);
  });

  socket.on("disconnect", () => {
    console.log(`Chat disconnected: ${socket.user.name} (${socket.id})`);
  });
});

function getServerResponse(message) {
  const text = message.toLowerCase();

  if (/hello|hi|hey/.test(text)) {
    return "Hello! 👋 How can I help you with your Buy It order?";
  }
  if (/order|delivery|deliver|shipping/.test(text)) {
    return "I can help with orders and delivery. Please check your Dashboard for your latest order status.";
  }
  if (/product|products|item/.test(text)) {
    return "You can browse all available products from the Home page. If you cannot find an item, tell me its name.";
  }
  if (/cart|basket/.test(text)) {
    return "You can review or update your cart from the Cart page before checkout.";
  }
  if (/payment|pay|checkout/.test(text)) {
    return "For payment questions, please make sure you are logged in and continue through the Checkout page.";
  }
  if (/thank|thanks/.test(text)) {
    return "You're welcome! 😊 I'm happy to help.";
  }

  return `Thanks for your message: "${message}". Our server received it successfully. Please tell me if you need help with products, cart, orders, delivery, or checkout.`;
}

httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
