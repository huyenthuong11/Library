import express from "express";
import Document from "../models/Document.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
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
        const inventorySummary = await Document.aggregate([
            { $unwind: "$locations" },
            {
                $group: {
                    _id: null,
                    totalCopies: { $sum: 1 },
                    available: { $sum: { $cond: [{ $eq: ["$locations.status", "available"] }, 1, 0] } },
                    borrowed: { $sum: { $cond: [{ $eq: ["$locations.status", "borrowed"] }, 1, 0] } },
                    overdue: { $sum: { $cond: [{ $eq: ["$locations.status", "overdue"] }, 1, 0] } },
                    reserved: { $sum: { $cond: [{ $eq: ["$locations.status", "reserved"] }, 1, 0] } }
                }
            }
        ]);
        const total = await Document.countDocuments();
        const books = await Document
            .find(query)
            .skip(skip)
            .limit(20);
        const totalBooks = await Document.countDocuments(query);
        res.json({
            data: books,
            totalPages: Math.ceil(totalBooks / 20),
            totalBook: total,
            inventorySum: inventorySummary[0]
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

// DELETE /api/books/deleteBook/:id
router.delete("/deleteBook/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const book = await Document.findOneAndDelete({ 
            _id: req.params.id
        })
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        res.status(200).json({ message: "Xóa sách thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Xóa sách thất bại", err });
    }
})

// DELETE /api/books/deleteCopy/:id
router.delete("/deleteCopy/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const {id} = req.params;
        const book = await Document.findOneAndUpdate(
            {"locations._id": id},
            {
                $pull: { locations: { _id: id } },
                $inc: { numberOfCopy: -1, availableCopies: -1 }
            }, 
            {new: true}
        );

        if (!book) return res.status(404).json({ message: "Không tìm thấy bản copy này!" });
        res.status(200).json({ message: "Xóa bản copies thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Xóa sách thất bại", err });
    }
})

export default router;