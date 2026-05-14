import express from "express";
import BorrowRecord from "../models/BorrowRecord.js";
import Document from "../models/Document.js";
import Reader from "../models/user/Reader.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";

const router = express.Router();

// GET /api/borrowRecord/getBorrowRecord
// Lấy tất cả bản ghi mượn (giới hạn 20 bản ghi gần nhất)
router.get("/getBorrowRecord", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const borrowRecords = await BorrowRecord.find()
        .populate("readerId")
        .populate("documentId")
        .limit(20);
        res.status(200).json(borrowRecords);
    } catch (err) {
        res.status(500).json({ message: "Failed to get borrow records", err });
    }
});

// GET /api/borrowRecord/getBorrowRecordByReader
// Lấy lịch sử mượn của một độc giả (giới hạn 20 bản ghi gần nhất)
router.get("/getBorrowRecordByReader", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const {accountId} = req.query;
        const borrowRecords = await BorrowRecord.find({readerId: accountId})
        .populate("documentId")
        .populate("copyId")
        .limit(20);
        res.status(200).json(borrowRecords);
    } catch (err) {
        res.status(500).json({ message: "Failed to get borrow records", err });
    }
});

// GET /api/borrowRecord/getBorrowRecordByCopy
// Lấy lịch sử mượn của một bản sao sách (giới hạn 20 bản ghi gần nhất)
router.get("/getBorrowRecordByCopy", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const {copyId} = req.query;
        const borrowRecords = await BorrowRecord
        .find({copyId: copyId})
        .populate("readerId")
        .populate("documentId")
        .limit(20);
        
        res.status(200).json(borrowRecords);
    } catch (err) {
        res.status(500).json({ message: "Failed to get borrow records", err });
    }
});

// GET /api/borrowRecord/reader/:readerId 
// Xem lịch sử của 1 độc giả (giới hạn 20 bản ghi gần nhất)
router.get("/reader/:readerId", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const { readerId } = req.params;
        const borrowRecords = await BorrowRecord.find({ readerId: readerId })
        .populate("documentId")
        .populate("copyId")
        .sort({ borrowDate: -1 })
        .limit(20);
        
        res.status(200).json(borrowRecords);
    } catch (err) {
        res.status(500).json({ message: "Failed to get borrow records by reader", err });
    }
});

export default router;