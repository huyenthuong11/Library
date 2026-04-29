import express from "express";
import News from "../models/News.js";
import upload from "../middleware/imageMiddleware.js";
import fs from "fs";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";


const router = express.Router();

// GET /api/news/getNews
router.get("/getNews", async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const news = await News
            .find({createdAt: { $gte: oneMonthAgo }})
            .sort({ createdAt: -1 });

        res.json({ data: news });
    } catch (err) {
        res.status(500).json({ message: "Failed to get news", err });
    }
});

//GET api/news/getNewsDetails/:id
router.get("/getNewsDetails/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const news = await News.findById(id);
        if (!news) return res.status(404).json({ message: "News not found" });
        res.json({data: news});
    } catch (err) {
        res.status(500).json({ message: "Failed to get news details", err });
    }
})

//POST api/news/postNews
router.post("/postNews", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), upload.single("image"), async(req, res) => {
    const {title, content, type} = req.body;
    const imagePath = 'uploads\\1774098503193-banner.png'.replace(/\\/g, '/');
    let finalPath = req.file ? req.file.path : imagePath;
    try {
        await News.create([{
            title: title,
            type: type,
            content: Array.isArray(content) ? content : [content],
            image: finalPath, 
            createdAt: new Date()
        }]);
        res.status(200).json('Tạo tin tức thành công');
    } catch (error) {
        console.log(error);
        res.status(500).json('Tạo tin tức thất bại');
    }
})

export default router;

