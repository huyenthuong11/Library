import express from "express";
import Account from "../models/user/Account.js";
import Reader from "../models/user/Reader.js";
import LocationList from "../models/LocationList.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import { format } from "path";
import BorrowRecord from "../models/BorrowRecord.js";
import Document from "../models/Document.js";
import Librarian from "../models/user/Librarian.js";
import mongoose from "mongoose";
import upload from "../middleware/imageMiddleware.js";
import fs from "fs";
import path from "path";
import checkStatus from "../middleware/authStatusMiddleware.js";

const router = express.Router();

// GET /api/admin/readerProfile/:id
router.get("/readerProfile/:id", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
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

// GET /api/admin/readerProfile
router.get("/readerProfile", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const readerProfile = await Reader
        .find()
        .select("-password");
        res.status(200).json(readerProfile);
    } catch (err) {
        console.error("Error: - adminRoutes.js:35", err);
        res.status(500).json({ message: "Failed to get reader profile", err });
    }
});

//GET api/admin/availableLocationList
router.get("/availableLocationList", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const availableLocationList = await LocationList.find();
        res.status(200).json(availableLocationList);
    } catch (err) {
        console.error("Error: - adminRoutes.js:35", err);
        res.status(500).json({ message: "Failed to get reader profile", err });
    }
});

//GET api/admin/newAccountsTrend
router.get("/newAccountsTrend", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const newAccountsTrend = await Account.aggregate([
            { $match: { role: "reader" }},
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%m-%Y",
                            date: "$createdAt"
                        }
                    },
                    readerSum: {$sum: 1}
                }
            },
            {$sort: {_id: 1}}
        ])
        console.log(newAccountsTrend);
        res.status(200).json(newAccountsTrend);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Tải danh sách người dùng thất bại"})
    }
})

//GET api/admin/accountsInventory
router.get("/accountsInventory", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const staticField = {};

        //Tổng người đọc và thủ thư
        const totalUser = await Account.aggregate([
            {
                $group: {
                    _id: null,
                    readerSum: {$sum: {$cond: [
                        {$and:[
                            {$eq: ["$role", "reader"]},
                            {$eq: ["$status", "activate"]}
                        ]}, 1, 0
                    ]}},
                    librarianSum: {$sum: {$cond: [
                        {$and:[
                            {$eq: ["$role", "librarian"]},
                            {$eq: ["$status", "activate"]}
                        ]}, 1, 0
                    ]}},
                }
            }
        ]);

        staticField.totalReader = totalUser[0]?.readerSum;
        staticField.totalLibrarian = totalUser[0]?.librarianSum;

        const startOfMonth = new Date();
        startOfMonth.setHours(0, 0, 0, 0);
        startOfMonth.setDate(1);

        //Người đọc mới
        const newReaders = await Account.find({ createdAt: { $gte: startOfMonth }}); 
        const totalNewReaders = newReaders.length;
        staticField.totalNewReaders = totalNewReaders;

        //Người dùng đang hoạt động

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const activeUser = await BorrowRecord.distinct("readerId");

        staticField.activeReaders = activeUser.length;

        //Người dùng quá hạn
        const overdueReader = await Document.aggregate([
            { $unwind: "$locations" },
            { $match: { "locations.status": "overdue" } },
            {
                $group: {
                _id: "$locations.readerId"
                }
            },
            {
                $count: "overdueReaders"
            }
        ]);

        staticField.overdueReaders = overdueReader[0]?.overdueReaders || 0;

        //Trung bình mượn
        const totalBorrow = await Reader.aggregate([
            {$group: {
                _id: null,
                totalBorrow: {$sum: "$totalBorrow"}
            }}
        ]);

        const averageBorrow = totalBorrow[0]?.totalBorrow / totalUser[0]?.readerSum;
        staticField.averageBorrow = averageBorrow;

        res.status(200).json(staticField);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Tải danh sách người dùng thất bại"})
    }
})

//GET api/admin/libInventory
router.get("/libInventory", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    try{
        const libInven = await Account.aggregate([
            {
                $group: {
                    _id: null,
                    totalLibrarian: {$sum: {$cond:[{$eq: ["$role", "librarian"]}, 1, 0]}},
                    actiLibrarianSum: {$sum: {$cond: [
                        {$and:[
                            {$eq: ["$role", "librarian"]},
                            {$eq: ["$status", "activate"]}
                        ]}, 1, 0
                    ]}},
                    deactiLibrarianSum: {$sum: {$cond: [
                        {$and:[
                            {$eq: ["$role", "librarian"]},
                            {$eq: ["$status", "deactivate"]}
                        ]}, 1, 0
                    ]}},
                }
            }
        ]);
        console.log(libInven);
        res.status(200).json(libInven[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"})
    }
})


//GET api/admin/librarianList
router.get("/librarianList", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const librarianList = await Librarian.find().populate('accountId', '_id email status');
        console.log(librarianList);
        res.status(200).json(librarianList);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi khi lấy danh sách thủ thư"});
    }
});

//POST api/admin/addLibrarian
router.post("/addLibrarian", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), upload.single("avatar"), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {email, password, fullName} = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email là bắt buộc",
            });
        }

        if(!password) {
            return res.status(400).json({
                message: "Password là bắt buộc",
            });
        }

        const account = await Account.findOne({ email });
        
        if(account) {
            return res.status(400).json({
                message: "Email đã tồn tại",
            });
        }
        
        const newAccount = new Account({
            email,
            password,
            role: "librarian"
        });

        await newAccount.save();

        const libData = {
            accountId: newAccount._id,
            fullName,
            avatar: req.file ? req.file.path : null
        }

        const newLibrarian = new Librarian(libData);
        await newLibrarian.save();

        res.status(200).json({message: "Thêm thủ thư thành công!"})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Thêm thủ thư thất bại!"})
    }
});

//PATCH api/admin/deactivateAccount/:accountId
router.patch("/deactivateAccount/:accountId", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const acc = await Account.findByIdAndUpdate(
            req.params.accountId,
            {$set: {"status": "deactivate"}},
            {new: true}
        );
        if (!acc) res.status(400).json({message: 'Tài khoản không tồn tại'});
        res.status(200).json({message: "Vô hiệu hóa tài khoản thành công!"})
    } catch (error) {
        console.error(err);
        res.status(500).json({message: "Vô hiệu hóa tài khoản thất bại!"})
    }
})

export default router;