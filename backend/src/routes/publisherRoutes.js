import express from "express";
import Document from "../models/Document.js";
import Publisher from "../models/Publisher.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";

const router = express.Router();
// GET /api/publisher/getPublisherProfile
router.get("/getPublisherProfile", authMiddleware, async(req, res) => {
    try {
        const publishers = await Publisher.find({ status: "Active" });
        res.status(200).json(publishers);
    } catch (err) {
        res.status(500).json({ message: "Failed to get publisher profile" });
    }
})

export default router;
