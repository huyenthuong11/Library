import express from "express";
import Reader from "../models/user/Reader.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";


const router = express.Router();

// GET /api/admin/readerProfile/:id
router.get("/readerProfile/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const {id} = req.params;
        const readerProfile = await Reader
        .findOne({_id: id})
        .select("-password");
        if (!readerProfile) return res.status(404).json({ message: "Người dùng không tồn tại" });
        res.status(200).json(readerProfile);
    } catch (err) {
        res.status(500).json({ message: "Failed to get reader profile" });
    }
});

export default router;