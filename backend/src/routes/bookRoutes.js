import express from "express";
import Document from "../models/Document.js";

const router = express.Router();

// GET /api/books/availableBook
router.get("/availableBook", async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * 20;


        const books = await Document
            .find()
            .skip(skip)
            .limit(20);
        const totalBooks = await Document.countDocuments();
        res.json({
            data: books,
            totalPages: Math.ceil(totalBooks / 20),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get available book" });
    }
})

export default router;