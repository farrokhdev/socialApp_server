import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";

import { createPost } from "./controllers/posts.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import { users, posts } from "./data/index.js";
import User from "./models/User.js";
import Post from "./models/Post.js";

// for web socket
import { WebSocketServer } from "ws";
import http from "http";

// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });

// CONFIG
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ extends: true, limit: "40mb" }));
app.use(bodyParser.urlencoded({ extends: true, limit: "40mb" }));
app.use(cors());
app.use("assets", express.static(path.join(__dirname, "public/assets")));

// FILE STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cd(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cd(null, file.originalname);
  },
});

const upload = multer({ storage });

// ROUTES JUST FOR UPLOAD
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
// ROUTES FOR OTHER ROUTES
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/posts", postRoutes);

// MONGO DB CONNECTION
const PORT = process.env.PORT || 6000;
const SOCKET_PORT = process.env.SOCKET_PORT;
mongoose
  .connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`server is running at port ${PORT}`));
    // Post.insertMany(posts);
    // User.insertMany(users);
    server.listen(SOCKET_PORT, () => {
      console.log(`WebSocket server is running on PORT ${SOCKET_PORT}`);
    });
  })
  .catch((err) => console.log(err));
