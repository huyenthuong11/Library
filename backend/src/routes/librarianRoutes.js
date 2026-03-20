import express from "express";
import Librarian from "../models/user/Librarian.js";


const router = express.Router();


// GET /api/librarian/librarianProfile
router.get("/librarianProfile", async(req, res) => {
    try {
        const {accountId} = req.query;
        const libraryProfile = await Librarian
        .findOne({accountId});
        res.status(200).json(libraryProfile);
    } catch (err) {
        res.status(500).json({ message: "Failed to get librarian profile" });
    }
});

//PUT api/librarian/:id
router.put("/:id", async(req, res) => {
    try {
        const { fullName } = req.body;
        const updateData = Librarian.findByIdAndDelete(
            req.params.id,
            { fullName },
            { new: true }
        );
        res.json({
            message: "Update librarian success",
            data: updateData
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update librarian profile" });
    }
});

export default router;