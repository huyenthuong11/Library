import express from "express";
import News from "../models/News.js";

const router = express.Router();

// GET /api/news/getNews
router.get("/getNews", async (req, res) => {
    try {
        const news = await News
            .find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({ data: news });
    } catch (err) {
        res.status(500).json({ message: "Failed to get news", err });
    }
});

//GET api/news/getNewsDetails/:id
router.get("/getNewsDetails/:id", async(req, res) => {
    try {
        const id = req.query.id;
        const news = await News.findOne(id);
        res.json({data: news});
    } catch (err) {
        res.status(500).json({ message: "Failed to get news details", err });
    }
})

export default router;

