import dotenv from "dotenv";
import dns from "node:dns";

dotenv.config();

// 🔥 DNS fix ONLY for local development
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authMiddleware from "./middleware/authMiddleware.js";
import cloudinary from "./config/cloudinary.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

const app = express();

// 🔥 trust proxy (needed for deployment)
app.set("trust proxy", 1);

// 🔥 create HTTP server
const server = http.createServer(app);

// 🔥 allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  process.env.CLIENT_URL
];

// 🔥 socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// make io globally accessible
global.io = io;

// socket connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinProduct", (productId) => {
    socket.join(productId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// 🔥 middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// 🔥 routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bids", bidRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ msg: "Access granted", user: req.user });
});

// 🔥 global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// 🔥 MongoDB connect
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
  });