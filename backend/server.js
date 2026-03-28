import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import mongoose from "mongoose";
import "./src/config/env.js";
import authRoutes from "./src/routes/authRoutes.js";
import readerRoutes from "./src/routes/readerRoutes.js";
import librarianRoutes from "./src/routes/librarianRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import forgotPasswordRoutes from "./src/routes/forgotPasswordRoutes.js";
import newsRoutes from "./src/routes/newsRoutes.js"
//load env
dotenv.config();

const app = express();
console.log("ENV TEST: - server.js:15", process.env.GEMINI_API_KEY);

//middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/reader", readerRoutes);
app.use("/api/librarian", librarianRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/books", bookRoutes);
app.use("/api/forgotPassword", forgotPasswordRoutes);
app.use("/api/news", newsRoutes);

//connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected - server.js:29"))
.catch((err) => console.log("MongoDB error - server.js:30", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - server.js:35`);
});

