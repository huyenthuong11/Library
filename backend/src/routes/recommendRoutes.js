import express from "express";
import Document from "../models/Document.js";
import authMiddleware from "../middleware/authMiddleware.js";
import BorrowRecord from "../models/BorrowRecord.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import mongoose from "mongoose";
import ChatHistory from "../models/ChatHistory.js";
import { recommendBook } from "../services/ai.service.js";
import Reader from "../models/user/Reader.js";

const router = express.Router();

//GET /recommend/recommendedBooks/:readerId
router.get("/recommendedBooks/:readerId", authMiddleware, checkRole(["reader"]), async(req, res) => {
    
    try {
        const { readerId } = req.params;
        const preferences = await BorrowRecord.aggregate([
            {
                $match: {
                    readerId: new mongoose.Types.ObjectId(readerId),
                    action: "registered"
                }
            },
            {
                $lookup: {
                    from: "documents",
                    localField: "documentId",
                    foreignField: "_id",
                    as: "document"
                }
            },
            { $unwind: "$document" },
            {
                $facet: {
                    categories: [
                        {
                            $group: {
                                _id: "$document.category",
                                count: {$sum: 1}
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 3 }
                    ],
                    authors: [
                        {$match: {"document.author": {$ne: "Không rõ"}}},
                        { 
                            $group: {
                                _id: "$document.author",
                                count: {$sum: 1}
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 3 }
                    ]
                }
            }
        ]);

        if (!preferences.length || 
            (preferences[0].categories.length === 0 
            && preferences[0].authors.length === 0)) {
            const popularBooks = await BorrowRecord.aggregate([
                { $match: { action: "borrowed" } },
                {
                    $group: {
                    _id: "$documentId",
                    count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 4 },
                {
                $lookup: {
                    from: "documents",
                    localField: "_id",
                    foreignField: "_id",
                    as: "document"
                }
                },
                { $unwind: "$document" },
                { $replaceRoot: { newRoot: "$document" } }
            ]);
            return res.status(200).json(popularBooks);
        } else {

            const borrowedDocs = await BorrowRecord.distinct("documentId", {
                readerId: new mongoose.Types.ObjectId(readerId)
            });

            const favoriteCategories = preferences[0].categories.map(c => c._id);
            const favoriteAuthors = preferences[0].authors.map(a => a._id);

            const recommendations = await Document.find({
                _id: { $nin: borrowedDocs },
                $or: [
                    { category: { $in: favoriteCategories } },
                    { author: { $in: favoriteAuthors } }
                ]
            }).limit(4);
            return res.status(200).json(recommendations);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi tải danh sách sách gợi ý", error: err.message});
    }
});

//POST /recommend/chatbot/:readerId
router.post("/chatbot/:readerId", authMiddleware, checkRole(["reader"]), async(req, res) => {
    try {
        const {userMessage} = req.body;

        await ChatHistory.create({
            readerId: req.params.readerId,
            message: userMessage, 
            role: "user"
        });

        const history = await ChatHistory
            .find({readerId: req.params.readerId})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const reader = await Reader.findById(req.params.readerId);

        const aiReply = await recommendBook(userMessage, reader.fullName, history.reverse());

        const newAiChatMessage = await ChatHistory.create({
            readerId: req.params.readerId,
            message: aiReply,
            role: "bot"
        });

        res.status(200).json(newAiChatMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI rep failed" });
    }
})

router.get("/getChatHistory/:readerId", async(req, res) => {
    try{
        const {limit} = req.query;
        console.time("getHistory");
        const tempEntries = await ChatHistory
        .find({ readerId: req.params.readerId })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        const entries = (tempEntries && tempEntries.length > 0) 
            ? tempEntries.reverse() 
            : [];
        console.timeEnd("getHistory");
        res.status(200).json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve chat entries" });
    }
});

export default router;