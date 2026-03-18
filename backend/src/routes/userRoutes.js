import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/users/profile
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Lấy profile thành công",
    });
});

export default router;