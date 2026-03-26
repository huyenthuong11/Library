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
                { author: { $regex: searchRegex } }
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




export default router;