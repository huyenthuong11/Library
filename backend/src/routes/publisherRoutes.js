import express from "express";
import Document from "../models/Document.js";
import Publisher from "../models/Publisher.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";

const router = express.Router();

// GET /api/publisher/getPublisherProfile (API Cũ giữ nguyên)
router.get("/getPublisherProfile", authMiddleware, async(req, res) => {
    try {
        const publishers = await Publisher.find({ status: "Active" });
        res.status(200).json(publishers);
    } catch (err) {
        res.status(500).json({ message: "Failed to get publisher profile" });
    }
});

// 1. LẤY TẤT CẢ DANH SÁCH NHÀ XUẤT BẢN (Cho trang quản lý của Admin)
// GET /api/publisher/all
router.get("/all", authMiddleware, checkRole(["admin", "librarian"]), async (req, res) => {
    try {
        // Sắp xếp NXB mới tạo lên đầu
        const publishers = await Publisher.find().sort({ createdAt: -1 });
        res.status(200).json(publishers);
    } catch (err) {
        console.error("Lỗi khi lấy NXB:", err);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách nhà xuất bản" });
    }
});

// 2. THÊM NHÀ XUẤT BẢN MỚI
// POST /api/publisher/create
router.post("/create", authMiddleware, checkRole(["admin", "librarian"]), async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        // Kiểm tra xem NXB đã tồn tại chưa (check theo tên)
        const existingPublisher = await Publisher.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existingPublisher) {
            return res.status(400).json({ message: "Tên nhà xuất bản này đã tồn tại!" });
        }

        const newPublisher = new Publisher({
            name,
            email,
            phone,
            address,
            status: "Active" // Mặc định là Active
        });

        await newPublisher.save();
        res.status(201).json({ message: "Thêm nhà xuất bản thành công!", data: newPublisher });
    } catch (error) {
        console.error("Lỗi khi tạo NXB:", error);
        res.status(500).json({ message: "Lỗi server khi thêm nhà xuất bản" });
    }
});

// 3. CẬP NHẬT THÔNG TIN NHÀ XUẤT BẢN
// PUT /api/publisher/update/:id
router.put("/update/:id", authMiddleware, checkRole(["admin", "librarian"]), async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        const updatedPublisher = await Publisher.findByIdAndUpdate(
            req.params.id,
            { $set: { name, email, phone, address } },
            { new: true }
        );

        if (!updatedPublisher) {
            return res.status(404).json({ message: "Không tìm thấy nhà xuất bản!" });
        }

        res.status(200).json({ message: "Cập nhật thành công!", data: updatedPublisher });
    } catch (error) {
        console.error("Lỗi khi cập nhật NXB:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật nhà xuất bản" });
    }
});

// 4. XÓA NHÀ XUẤT BẢN
// DELETE /api/publisher/delete/:id
router.delete("/delete/:id", authMiddleware, checkRole(["admin", "librarian"]), async (req, res) => {
    try {
        const publisherId = req.params.id;

        // KIỂM TRA AN TOÀN: Xem có sách nào đang mượn NXB này không
        const linkedBooks = await Document.findOne({ publisherId: publisherId });
        if (linkedBooks) {
            return res.status(400).json({ message: "Không thể xóa! Đang có sách trong thư viện thuộc Nhà xuất bản này." });
        }

        const deletedPublisher = await Publisher.findByIdAndDelete(publisherId);
        
        if (!deletedPublisher) {
            return res.status(404).json({ message: "Không tìm thấy nhà xuất bản!" });
        }
        
        res.status(200).json({ message: "Đã xóa nhà xuất bản thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa NXB:", error);
        res.status(500).json({ message: "Lỗi server khi xóa nhà xuất bản" });
    }
});

export default router;