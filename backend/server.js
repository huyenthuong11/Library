import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import mongoose from "mongoose";

import "./src/config/env.js";
import startCronJobs from "./src/services/cronJobService.js";

// Khai báo các Routes
import authRoutes from "./src/routes/authRoutes.js";
import readerRoutes from "./src/routes/readerRoutes.js";
import librarianRoutes from "./src/routes/librarianRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import forgotPasswordRoutes from "./src/routes/forgotPasswordRoutes.js";
import newsRoutes from "./src/routes/newsRoutes.js";
import publisherRoutes from "./src/routes/publisherRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import borrowRecordRoutes from "./src/routes/borrowRecordRoutes.js";
import chartRoutes from "./src/routes/chartRoutes.js";
import recommendRoutes from "./src/routes/recommendRoutes.js"; // Đã thêm lại dòng này
import violationRoutes from "./src/routes/violationRoutes.js";

//load env
dotenv.config();

const app = express();
console.log("ENV TEST: - server.js:15", process.env.MONGO_URI);

//middleware
app.use(cors());
app.use(express.json());

// Khai báo API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/reader", readerRoutes);
app.use("/api/librarian", librarianRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/books", bookRoutes);
app.use("/api/forgotPassword", forgotPasswordRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/publisher", publisherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/borrowRecord", borrowRecordRoutes);
app.use("/api/chart", chartRoutes);
app.use("/api/recommend", recommendRoutes); // Đã thêm lại dòng này
app.use("/api/violation", violationRoutes);

//cron
startCronJobs();

//connect MongoDB
mongoose.connect(process.env.MONGO_URI, { family: 4 })
.then(()=> console.log("MongoDB connected - server.js:29"))
.catch((err) => console.log("MongoDB error - server.js:30", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - server.js:35`);
});