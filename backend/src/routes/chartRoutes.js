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
import fs, { read } from "fs";
import { create } from "domain";
import checkStatus from "../middleware/authStatusMiddleware.js";

const router = express.Router();

// GET /api/chart/getCategoryChartData
router.get("/getCategoryChartData", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) =>{
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

        res.status(200).json({
            total: totalDocs,
            composition: formattedData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//GET /api/chart/getBorrowTrendData
router.get("/getBorrowTrendData", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) =>{
    try {
        const borrowTrendData = await BorrowRecord.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%m-%Y",
                            date: "$createdAt"
                        }
                    },
                    registered: { $sum: { $cond: [{ $eq: ["$action", "registered"] }, 1, 0] } },
                    borrowed: { $sum: { $cond: [{ $eq: ["$action", "borrowed"] }, 1, 0] } },
                    returned: { $sum: { $cond: [{ $eq: ["$action", "returned"] }, 1, 0] } }
                }
            },
            {$sort: {_id: 1}}
        ])
        res.status(200).json(borrowTrendData);
    } catch (err) {
        res.status(500).json({ message: "Failed to get borrow trend data" });
    }
})

//GET /api/chart/topCategory
router.get("/topCategory", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) =>{
    try {
        const topCategory = await Document.aggregate([
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category",
                    borrowedCount: {$sum: "$borrowedCount"}
                }
            },
            { $sort: {borrowedCount: -1} },
            { $limit: 6 }
        ]);
        res.status(200).json(topCategory);
    } catch (err) {
        res.status(500).json({ message: "Failed to get top category" });
    }
})

//lấy data để làm tỷ lệ đặt/lấy
//GET /api/chart/conversionStats
router.get("/conversionStats", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const records = await BorrowRecord.find({
            action: { $in: ["registered", "borrowed", "canceled"] }
        }).sort({createdAt: 1});
        const pendingReservations = {};
        let stats = {
            webConversion: 0,
            walkIn: 0,
            expired: 0,
            cancel: 0
        };
        const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
        records.forEach(record => {
            const key = `${record.readerId}-${record.copyId}`;
            if (record.action === "registered") {
                if (!pendingReservations[key])
                pendingReservations[key] = record.createdAt;
            } else if (record.action === "canceled") {
                if(pendingReservations[key]) {
                    stats.cancel++;
                    delete pendingReservations[key];
                }
            } else if (record.action === "borrowed") {
                const regTime = pendingReservations[key];
                if (regTime && record.createdAt - regTime <= THREE_DAYS_MS) {
                    stats.webConversion++;
                    delete pendingReservations[key];
                } else {
                    stats.walkIn++;
                }
            }    
        });

        for (const key in pendingReservations) {
            if (Date.now() - new Date(pendingReservations[key]).getTime() > THREE_DAYS_MS) {
                stats.expired++;
            }
        }
        res.status(200).json(stats);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get data" });
    }    
})

export default router;