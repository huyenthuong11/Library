import express from "express";
import BorrowRecord from "../models/BorrowRecord.js";
import Document from "../models/Document.js";
import Reader from "../models/user/Reader.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";

const router = express.Router();

// GET /api/borrowRecord/getBorrowRecord
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

export default router;