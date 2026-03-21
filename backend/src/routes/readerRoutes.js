import express from "express";
import Reader from "../models/user/Reader.js";
import upload from "../middleware/imageMiddleware.js";

const router = express.Router();

// GET /api/reader/readerProfile
router.get("/readerProfile", async(req, res) => {
    try {
        const {accountId} = req.query;
        const readerProfile = await Reader
        .findOne({accountId});
        res.status(200).json(readerProfile);
    } catch (err) {
        res.status(500).json({ message: "Failed to get reader profile" });
    }
});

//PUT api/reader/:id
router.put("/:id", async(req, res) => {
    try {
        const { fullName, dateOfBirth, phoneNumber } = req.body;
        const updateFields = {};
        if (fullName) updateFields.fullName = fullName;
        if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
        if (phoneNumber) updateFields.phoneNumber = phoneNumber;
        const updateReader = await Reader.findByIdAndUpdate(
            req.params.id,
            updateFields,
            {new: true}
        );
        
        res.json({
            message: "Update reader success",
            data: updateReader
        });
    } catch (err) {
        console.error("Error: - readerRoutes.js:38", err)
        res.status(500).json({ message: "Failed to update reader profile" });
    }
});

//PUT api/reader/:id/avatar
router.put("/:id/avatar", upload.single("avatar"), async(req, res) => {
    try {
        const updateFields = {};
        if (req.file) {updateFields.avatar = req.file.path;}
        const updateReader = await Reader.findByIdAndUpdate(
            req.params.id,
            updateFields,
            {new: true}
        );
        
        res.json({
            message: "Update reader's avatar success",
            data: updateReader
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update reader's avatar profile" });
    }
});

export default router;