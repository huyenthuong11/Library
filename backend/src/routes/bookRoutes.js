import express from "express";
import Document from "../models/Document.js";
import Publisher from "../models/Publisher.js";
import Reader from "../models/user/Reader.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import upload from "../middleware/imageMiddleware.js";
const router = express.Router();
import path from "path";
import fs from "fs";
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
            .populate('publisherId')
            .populate("locations.readerId")
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

//PATCH /api/books/updateBook/:id
router.patch("/updateBook/:id", authMiddleware, checkRole(["admin", "librarian"]), upload.single("image"), async(req, res) => {
    try {
        const { category, style, publisherId, 
            title, coverPrice, publishDate, author, 
            description, language, pages} = req.body;
        const book = await Document.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
        const updateFields = {};
        if (category) {
            updateFields.category = Array.isArray(category) ? category : [category];
        }
        if (style) updateFields.style = style;
        if (publisherId) updateFields.publisherId = publisherId;
        if (title) updateFields.title = title;
        if (coverPrice) updateFields.coverPrice = coverPrice;
        if (publishDate) updateFields.publishDate = publishDate;
        if (author) updateFields.author = author;
        if (description) updateFields.description = description;
        if (language) updateFields.language = language;
        if (pages) updateFields.pages = pages;
        if (req.file) {
            updateFields.image = req.file.path;
            if (book.image) {
                const oldPath = path.join(process.cwd(), book.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }
        const updateBook = await Document.findByIdAndUpdate(
            req.params.id,
            updateFields,
            {new: true, runValidators: true}
        );
        if (!updateBook) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
         res.json({
            message: "Chỉnh sửa thành công",
            data: updateBook
        });       
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Chỉnh sửa thất bại", err });
    }
})



//PATCH /api/books/updateCopy/:id
router.patch("/updateCopy/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const { position, status, readerId } = req.body;
        const updateFields = {
            $set: {},
            $inc: {}
        };
        updateFields.$set["locations.$.createdAt"] = new Date();
        if (position) updateFields.$set["locations.$.position"] = position;
        if (status) updateFields.$set["locations.$.status"] = status;
        if (readerId) {
            const reader = await Reader.findById(readerId);
            if (reader) {
                updateFields.$set["locations.$.readerId"] = readerId;
                updateFields.$set["locations.$.readerName"] = reader.fullName;
            }
        }
        if (status === "borrowed") {
            updateFields.$inc = { borrowedCount: 1, availableCopies: -1 };
            updateFields.$set["locations.$.dueDate"] = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        } else if (status === "reserved") {
            updateFields.$set["locations.$.dueDate"] = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        } else if (status === "available") {
            updateFields.$inc = { availableCopies: 1 };
            updateFields.$set["locations.$.readerId"] = null;
            updateFields.$set["locations.$.readerName"] = null;
            updateFields.$set["locations.$.dueDate"] = null;
            updateFields.$set["locations.$.createdAt"] = null;
        }

        const updateCopy = await Document.findOneAndUpdate(
            {"locations._id": req.params.id},
            updateFields,
            { new: true, runValidators: true }
        ).populate("locations.readerId");

        if (!updateCopy) {
            return res.status(404).json({ message: "Không tìm thấy bản copy" });
        }
        res.json({
            message: "Cập nhật bản copy thành công",
            data: updateCopy
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Xóa sách thất bại", err });
    }
})


export default router;