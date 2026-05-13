import express from "express";
import mongoose from "mongoose";
import EBook from "../models/EBook.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";
import EBookRecord from "../models/EBookRecord.js";
import Reader from "../models/user/Reader.js";

import multer from "multer";
import path from "path";

// Cấu hình Multer để upload ảnh bìa và file Ebook
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf" || file.mimetype === "application/epub+zip") {
        cb(null, true);
    } else {
        cb(new Error("Chỉ hỗ trợ định dạng ảnh và file PDF/EPUB!"), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const router = express.Router();

// ==========================================
// API DÀNH CHO ADMIN / THỦ THƯ
// ==========================================

// Lấy tất cả Ebook (Đã tối ưu chống tràn RAM)
router.get("/all", authMiddleware, checkRole(["admin", "librarian"]), async (req, res) => {
    try {
        console.log("1. Bắt đầu lấy danh sách Ebook cho Admin...");
        
        // BẮT BUỘC PHẢI CÓ .select("-content") ĐỂ TRÁNH QUÁ TẢI SERVER
        const ebooks = await EBook.find().sort({ createdAt: -1 }).select("-content");
        
        console.log(`2. Lấy thành công ${ebooks.length} cuốn Ebook!`);
        res.status(200).json(ebooks);
    } catch (err) {
        console.error("=== LỖI 500 TẠI GET /ebooks/all ===", err);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách Ebook" });
    }
});

// Thêm Ebook mới
router.post("/create", authMiddleware, checkRole(["admin", "librarian"]), upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'fileUrl', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, author, category, description, publisherId, isbn, price } = req.body;
        
        let coverImagePath = req.files && req.files['coverImage'] ? req.files['coverImage'][0].path.replace(/\\/g, "/") : "";
        let fileUrlPath = req.files && req.files['fileUrl'] ? req.files['fileUrl'][0].path.replace(/\\/g, "/") : "";

        const newEbook = new EBook({
            title, author, category, description,
            publisherId: publisherId || null,
            isbn: isbn || null, price: price || 0,
            image: coverImagePath, fileUrl: fileUrlPath
        });

        await newEbook.save();
        res.status(201).json({ message: "Thêm Ebook thành công!", data: newEbook });
    } catch (error) {
        console.error("Lỗi thêm Ebook:", error);
        res.status(500).json({ message: "Lỗi khi thêm Ebook" });
    }
});

// Cập nhật Ebook
router.put("/update/:id", authMiddleware, checkRole(["admin", "librarian"]), upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'fileUrl', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, author, category, description, publisherId, isbn, price } = req.body;
        let updateData = { title, author, category, description, publisherId, isbn, price };
        
        if (req.files && req.files['coverImage']) updateData.image = req.files['coverImage'][0].path.replace(/\\/g, "/");
        if (req.files && req.files['fileUrl']) updateData.fileUrl = req.files['fileUrl'][0].path.replace(/\\/g, "/");

        const updatedEbook = await EBook.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        if (!updatedEbook) return res.status(404).json({ message: "Không tìm thấy Ebook!" });

        res.status(200).json({ message: "Cập nhật thành công!", data: updatedEbook });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi cập nhật Ebook" });
    }
});

// Xóa Ebook
router.delete("/delete/:id", authMiddleware, checkRole(["admin", "librarian"]), async (req, res) => {
    try {
        const deletedEbook = await EBook.findByIdAndDelete(req.params.id);
        if (!deletedEbook) return res.status(404).json({ message: "Không tìm thấy Ebook!" });
        res.status(200).json({ message: "Đã xóa Ebook thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa Ebook" });
    }
});

// ==========================================
// API DÀNH CHO READER
// ==========================================

// GET /api/ebooks/availableEBooks/:readerId
router.get("/availableEBooks/:readerId", authMiddleware, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * 15;
        const {search} = req.query;
        
        let query = {};
        let sort = { createdAt: 1 };
        let projection = {};

        if (search) {
            query = { $text: { $search: search } };
            projection = { score: { $meta: "textScore" } };
            sort = { score: { $meta: "textScore" } };
        }

        const availableEBooks = await EBook
        .find({
            ...query,
            "readerId.reader": {$ne: req.params.readerId}
        }, projection)
        .sort(sort)
        .skip(skip)
        .limit(15)
        .select("-readerId")
        .select("-content");

        const totalBooks =  await EBook
        .countDocuments(query);
        res.status(200).json({
            data: availableEBooks,
            totalPages: Math.ceil(totalBooks / 15),
        });
    } catch (error) {
        res.status(500).json("Lấy danh sách Ebook thất bại");
    }
});

// POST api/ebooks/borrowBook/:readerId/:id
router.post("/borrowBook/:readerId/:id", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reader = await Reader.findById(req.params.readerId);
        if (!reader) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        await EBook.findOneAndUpdate(
            {_id: req.params.id},
            {$addToSet: {readerId: {reader: req.params.readerId, borrowedAt: new Date()}}},
            {$inc: {borrowedCount: 1}},
            {session, new: true }
        );

        await EBookRecord.create([{readerId: req.params.readerId, ebookId: req.params.id, action: "borrowed"}], { session });

        await session.commitTransaction();
        res.status(200).json("Mượn sách thành công!");
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json("Lỗi xảy ra khi đang mượn sách.");
    } finally {
        await session.endSession();
    }
});

// GET api/ebooks/getBooks/:id
router.get("/getBooks/:id", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) =>  {
    try {
        const book = await EBook.findById(req.params.id).select("-readerId");
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json("Lỗi lấy thông tin sách");
    }
});

// PATCH api/ebooks/return/:readerId/:id
router.patch("/return/:readerId/:id", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) =>{
    try {
        await EBook.updateOne(
            {"readerId.reader": req.params.readerId},
            {$pull: {readerId: {reader: req.params.readerId}}},
            {new: true}
        );
        res.status(200).json("Trả sách thành công!");
    } catch (error) {
        res.status(500).json("Lỗi trả sách");
    }
});

export default router;