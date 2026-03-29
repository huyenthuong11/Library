import express from "express";
import Document from "../models/Document.js";

const router = express.Router();

// GET /api/books/availableBook
router.get("/availableBook", async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * 20;
        const {search, category} = req.query;
        let query = {};
        if (category && category !== '') {
            query.category = { $in: [category] }; 
        }
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: { $regex: searchRegex } },
                { author: { $regex: searchRegex } },
                { isbn: { $regex: searchRegex }}
            ];
        }

        const books = await Document
            .find(query)
            .skip(skip)
            .limit(20);
        const totalBooks = await Document.countDocuments(query);
        res.json({
            data: books,
            totalPages: Math.ceil(totalBooks / 20),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get available book" });
    }
})

// GET /api/books/5newestBooks
router.get("/10newestBooks", async(req, res) => {
    try {
        const books = await Document
        .find()
        .sort({createAt: -1})
        .limit(10);

        res.json({
            data: books,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get 5 newest book", err });
    }
})

// GET /api/books/mostBorrowedBooks?limit=limit
router.get("/mostBorrowedBooks", async(req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const books = await Document
        .find()
        .sort({borrowedCount: -1})
        .limit(limit);

        res.json({
            data: books,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get 5 newest book", err });
    }
})


export default router;