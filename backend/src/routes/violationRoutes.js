import express from "express";
import Violation from "../models/Violation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";

const router = express.Router();

// Thủ thư lập biên bản (Đã bỏ lưu ID thủ thư)
router.post("/create", authMiddleware, checkRole(["librarian", "admin"]), async (req, res) => {
    try {
        const { readerId, documentId, copyId, reason, fineAmount } = req.body;

        const newViolation = new Violation({
            readerId, 
            documentId, 
            copyId, 
            reason, 
            fineAmount
            // Không lưu createdBy nữa
        });

        await newViolation.save();
        res.status(201).json({ message: "Lập biên bản thành công!", violation: newViolation });
    } catch (err) {
        console.error("Lỗi tạo biên bản:", err);
        res.status(500).json({ message: "Lỗi Server", err });
    }
});

// Admin/Thủ thư xem tất cả biên bản phạt (Đã bỏ populate creator)
router.get("/all", authMiddleware, checkRole(["librarian", "admin"]), async (req, res) => {
    try {
        const violations = await Violation.find()
            .populate("readerId", "fullName email")
            .populate("documentId", "title image")
            .sort({ createdAt: -1 }); 
        res.status(200).json(violations);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", err });
    }
});

router.patch("/update/:id", authMiddleware, checkRole(["librarian", "admin"]), async (req, res) => {
    try {
        const { reason, fineAmount, status } = req.body;
        const updatedViolation = await Violation.findByIdAndUpdate(
            req.params.id,
            { reason, fineAmount, status },
            { new: true }
        );
        if (!updatedViolation) return res.status(404).json({ message: "Không tìm thấy phiếu phạt" });
        res.status(200).json({ message: "Cập nhật thành công!", violation: updatedViolation });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", err });
    }
});

// Xóa phiếu phạt
router.delete("/delete/:id", authMiddleware, checkRole(["librarian", "admin"]), async (req, res) => {
    try {
        const deletedViolation = await Violation.findByIdAndDelete(req.params.id);
        if (!deletedViolation) return res.status(404).json({ message: "Không tìm thấy phiếu phạt" });
        res.status(200).json({ message: "Đã xóa phiếu phạt thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", err });
    }
});

export default router;