import express from "express";
import Violation from "../models/Violation.js";
import Reader from "../models/user/Reader.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";

const router = express.Router();

// Lấy danh sách tất cả phiếu phạt
// GET /api/violation/all
router.get("/all", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async (req, res) => {
    try {
        // Dùng populate để kéo thêm dữ liệu Tên độc giả và Tên sách/Ảnh bìa
        const violations = await Violation.find()
            .populate("readerId", "fullName email phoneNumber")
            .populate("documentId", "title image")
            .sort({ createdAt: -1 }); // Sắp xếp phiếu phạt mới nhất lên đầu
            
        res.status(200).json(violations);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vi phạm:", error);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách vi phạm" });
    }
});

// Xóa phiếu phạt
// DELETE /api/violation/delete/:id
router.delete("/delete/:id", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async (req, res) => {
    try {
        const deletedViolation = await Violation.findByIdAndDelete(req.params.id);
        
        if (!deletedViolation) {
            return res.status(404).json({ message: "Không tìm thấy phiếu phạt!" });
        }
        
        res.status(200).json({ message: "Đã xóa phiếu phạt thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa vi phạm:", error);
        res.status(500).json({ message: "Lỗi server khi xóa phiếu phạt" });
    }
});

// Cập nhật phiếu phạt (Dành cho Modal Edit)
// PUT /api/violation/update/:id
router.put("/update/:id", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async (req, res) => {
    try {
        const { reason, fineAmount, status } = req.body;
        
        const updatedViolation = await Violation.findByIdAndUpdate(
            req.params.id,
            { $set: { reason, fineAmount, status } },
            { new: true }
        );

        if (!updatedViolation) {
            return res.status(404).json({ message: "Không tìm thấy phiếu phạt!" });
        }

        res.status(200).json({ message: "Cập nhật thành công!", data: updatedViolation });
    } catch (error) {
        console.error("Lỗi khi cập nhật vi phạm:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật phiếu phạt" });
    }
});

// 1. TẠO PHIẾU PHẠT (Dành cho nút PHẠT của thủ thư)
// POST /api/violation/create
router.post("/create", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async (req, res) => {
    try {
        const { readerId, documentId, copyId, reason, fineAmount } = req.body;

        // Kiểm tra xem cuốn sách này đã bị phạt mà chưa nộp tiền hay chưa (tránh phạt trùng)
        const existingViolation = await Violation.findOne({ copyId, status: "unpaid" });
        if (existingViolation) {
            return res.status(400).json({ message: "Bản sao này hiện đang có 1 phiếu phạt chưa nộp!" });
        }

        const newViolation = new Violation({
            readerId,
            documentId,
            copyId,
            reason,
            fineAmount,
            status: "unpaid",
            createdBy: req.account?._id // Giả sử middleware của bạn gán thông tin người dùng vào req.account
        });

        await newViolation.save();
        res.status(201).json({ message: "Đã lập phiếu phạt thành công!", data: newViolation });
    } catch (error) {
        console.error("Lỗi khi tạo phiếu phạt:", error);
        res.status(500).json({ message: "Lỗi server khi lập phiếu phạt" });
    }
});

// 2. LẤY PHIẾU PHẠT CỦA 1 ĐỘC GIẢ CỤ THỂ (Dành cho popup trang chủ của Độc giả)
// GET /api/violation/reader/:id
router.get("/reader/:id", authMiddleware, checkRole(["reader", "admin", "librarian"]), checkStatus(["activate"]), async (req, res) => {
    try {
        const id = req.params.id;
        
        // TÌM KIẾM THÔNG MINH:
        // Dò xem id truyền lên có phải là accountId không
        const readerProfile = await Reader.findOne({ accountId: id });
        
        // Nếu tìm thấy hồ sơ Độc giả, ta lấy reader._id. Nếu không, cứ dùng thẳng id truyền lên.
        const targetReaderId = readerProfile ? readerProfile._id : id;

        // Tìm phiếu phạt dựa trên targetReaderId chính xác
        const violations = await Violation.find({ readerId: targetReaderId })
            .populate("documentId", "title image")
            .sort({ createdAt: -1 });
            
        res.status(200).json(violations);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vi phạm của độc giả:", error);
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu phạt" });
    }
});

export default router;