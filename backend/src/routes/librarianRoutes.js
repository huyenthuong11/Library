import express from "express";
import Librarian from "../models/user/Librarian.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";


const router = express.Router();


// GET /api/librarian/librarianProfile
router.get("/librarianProfile", authMiddleware, checkRole(["librarian"]), async(req, res) => {
    try {
        const {accountId} = req.query;
        const libraryProfile = await Librarian
        .findOne({accountId});
        res.status(200).json(libraryProfile);
    } catch (err) {
        res.status(500).json({ message: "Failed to get librarian profile" });
    }
});

export default router;