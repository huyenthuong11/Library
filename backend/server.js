import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import mongoose from "mongoose";
import "./config/env.js";

//load env
dotenv.config();

const app = express();
console.log("ENV TEST: - server.js:11", process.env.GEMINI_API_KEY);

//middleware
app.use(cors());
app.use(express.json());


//connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected - server.js:20"))
.catch((err) => console.log("MongoDB error - server.js:21", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - server.js:26`);
});

