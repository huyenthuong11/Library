import express from "express";
import Document from "../models/Document.js";
import Publisher from "../models/Publisher.js";
import LocationList from "../models/LocationList.js";
import Reader from "../models/user/Reader.js";
import BorrowRecord from "../models/BorrowRecord.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import upload from "../middleware/imageMiddleware.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// GET /api/chart/getCategoryChartData
router.get("/getCategoryChartData", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) =>{
    try {
        const totalDocs = await Document.countDocuments({ deleted: false });
        const stats = await Document.aggregate([
            { $match: { deleted: false } },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
        ]);
        const top6 = stats.slice(0, 6);
        const remaining = stats.slice(6);
        const othersCount = remaining.reduce((sum, item) => sum + item.count, 0);
        const formattedData = top6.map(item => ({
            label: item._id,
            value: item.count,
            percentage: ((item.count / totalDocs) * 100).toFixed(2) 
        }));

        if (othersCount > 0) {
            formattedData.push({
                label: "others",
                value: othersCount,
                percentage: ((othersCount / totalDocs) * 100).toFixed(2)
            });
        }
        console.log(totalDocs, formattedData);

        res.status(200).json({
            total: totalDocs,
            composition: formattedData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;