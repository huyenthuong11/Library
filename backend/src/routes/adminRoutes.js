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
import News from "../models/News.js";

const router = express.Router();

// GET /api/admin/readerProfile/:id
router.get("/readerProfile/:id", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const {id} = req.params;
        const readerProfile = await Reader
        .findOne({_id: id})
        .populate('accountId', '_id email status')
        .select("-password");
        if (!readerProfile) return res.status(404).json({ message: "Người dùng không tồn tại" });
        res.status(200).json(readerProfile);
    } catch (err) {
        res.status(500).json({ message: "Failed to get reader profile" });
    }
});

// GET /api/admin/readerProfile (Danh sách độc giả cũ)
router.get("/readerProfile", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const readerProfile = await Reader
        .find()
        .populate('accountId', '_id email status')
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
        res.status(500).json({ message: "Failed to get location list", err });
    }
});

//GET api/admin/newAccountsTrend
router.get("/newAccountsTrend", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
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
        res.status(200).json(newAccountsTrend);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Tải danh sách người dùng thất bại"})
    }
})

//GET api/admin/accountsInventory
router.get("/accountsInventory", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const staticField = {};

        const totalUser = await Account.aggregate([
            {
                $group: {
                    _id: null,
                    totalReader: { $sum: { $cond: [{ $eq: ["$role", "reader"] }, 1, 0] } },
                    readerSum: {$sum: {$cond: [
                        {$and:[
                            {$eq: ["$role", "reader"]},
                            {$eq: ["$status", "activate"]}
                        ]}, 1, 0
                    ]}},
                    deactiReaderSum: {$sum: {$cond: [
                        {$and:[
                            {$eq: ["$role", "reader"]},
                            {$eq: ["$status", "deactivate"]}
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

        staticField.total = totalUser[0]?.totalReader || 0;
        staticField.active = totalUser[0]?.readerSum || 0;
        staticField.inactive = totalUser[0]?.deactiReaderSum || 0;
        staticField.totalLibrarian = totalUser[0]?.librarianSum;

        const startOfMonth = new Date();
        startOfMonth.setHours(0, 0, 0, 0);
        startOfMonth.setDate(1);

        const newReaders = await Account.find({ createdAt: { $gte: startOfMonth }}); 
        staticField.totalNewReaders = newReaders.length;

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const activeUser = await BorrowRecord.distinct("readerId");
        staticField.activeReaders = activeUser.length;

        const overdueReader = await Document.aggregate([
            { $unwind: "$locations" },
            { $match: { "locations.status": "overdue" } },
            { $group: { _id: "$locations.readerId" } },
            { $count: "overdueReaders" }
        ]);

        staticField.overdueReaders = overdueReader[0]?.overdueReaders || 0;

        const totalBorrow = await Reader.aggregate([
            {$group: { _id: null, totalBorrow: {$sum: "$totalBorrow"} }}
        ]);

        const averageBorrow = totalBorrow[0]?.totalBorrow / (totalUser[0]?.readerSum || 1); 
        staticField.averageBorrow = averageBorrow;

        res.status(200).json(staticField);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Tải danh sách người dùng thất bại"})
    }
})

//GET api/admin/libInventory
router.get("/libInventory", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
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
        res.status(200).json(libInven[0] || {totalLibrarian: 0, actiLibrarianSum: 0, deactiLibrarianSum: 0});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"})
    }
})


//GET api/admin/librarianList
router.get("/librarianList", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const librarianList = await Librarian.find().populate('accountId', '_id email status');
        res.status(200).json(librarianList);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi khi lấy danh sách thủ thư"});
    }
});

//POST api/admin/addLibrarian
router.post("/addLibrarian", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), upload.single("avatar"), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {email, password, fullName} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email và Password là bắt buộc" });
        }

        const account = await Account.findOne({ email }).session(session); 
        
        if(account) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        
        const newAccount = new Account({
            email,
            password,
            role: "librarian"
        });

        await newAccount.save({ session }); 

        const libData = {
            accountId: newAccount._id,
            fullName,
            avatar: req.file ? req.file.path : null
        }

        const newLibrarian = new Librarian(libData);
        await newLibrarian.save({ session }); 

        await session.commitTransaction(); 
        res.status(200).json({message: "Thêm thủ thư thành công!"})
    } catch (error) {
        await session.abortTransaction(); 
        console.error(error);
        res.status(500).json({message: "Thêm thủ thư thất bại!"})
    } finally {
        session.endSession(); 
    }
});

// POST api/admin/createReader (API cũ)
router.post("/createReader", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { email, password, fullName, phoneNumber } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc" });
        }

        const existingAccount = await Account.findOne({ email }).session(session);
        if (existingAccount) {
            return res.status(400).json({ message: "Email này đã được đăng ký" });
        }
        
        const newAccount = new Account({ email, password, role: "reader" });
        await newAccount.save({ session });

        const readerData = {
            accountId: newAccount._id,
            email,
            fullName,
            phoneNumber: phoneNumber || ""
        };
        const newReader = new Reader(readerData);
        await newReader.save({ session });

        await session.commitTransaction();
        res.status(201).json({ message: "Thêm độc giả thành công!" });
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: "Lỗi server khi thêm độc giả!" });
    } finally {
        session.endSession();
    }
});

//PATCH api/admin/deactivateAccount/:accountId
router.patch("/deactivateAccount/:accountId", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const acc = await Account.findByIdAndUpdate(
            req.params.accountId,
            {$set: {"status": "deactivate"}},
            {new: true}
        );
        if (!acc) return res.status(400).json({message: 'Tài khoản không tồn tại'});
        res.status(200).json({message: "Vô hiệu hóa tài khoản thành công!"})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Vô hiệu hóa tài khoản thất bại!"})
    }
})

// GET /api/admin/getNewsAndAnnounce
router.get("/getNewsAndAnnounce", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const [news, announces] = await Promise.all([
            News.find({ createdAt: {$gte: threeDaysAgo}}).
            sort({createdAt: -1}),
            Document.find({
                locations: {
                    $elemMatch: {
                        "status": { $in: ["overdue", "reserved"] },
                        "createdAt": { $gte: threeDaysAgo }
                    }
                }
            })
            .sort({"locations.createdAt": -1})
            .lean()
        ]);
        const newsFormatted = news.map(item => ({
            _id: item._id,
            title: item.title,
            image: item.image,
            displayType: 'NEWS',
            compareDate: item.createdAt
        }));

        const announcesFormatted = [];
        announces.forEach(doc => {
            doc.locations.forEach(loc => {
                if (["overdue", "reserved"].includes(loc.status)
                    && loc.createdAt >= threeDaysAgo
                ) {
                    announcesFormatted.push({
                        _id: doc._id,
                        title: doc.title,
                        copyId: loc._id,
                        status: loc.status,
                        displayType: "ANNOUNCE",
                        compareDate: loc.createdAt
                    });
                }
            });
        });

        const cancelledOrders = await BorrowRecord.aggregate([
            {
                $match: { 
                    action: "canceled",
                    createdAt: { $gte: threeDaysAgo }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "readers",
                    localField: "readerId",
                    foreignField: "_id",
                    as: "reader"
                }
            },
            { $unwind: "$reader" },
            {
                $lookup: {
                    from: "documents",
                    localField: "documentId",
                    foreignField: "_id",
                    as: "document"
                }
            },
            { $unwind: "$document" }
        ]);

        const cancelledOrdersFormatted = [];
        cancelledOrders.map(co => {
            cancelledOrdersFormatted.push({
                _id: co._id,
                title: co.document.title,
                copyId: co.copyId,
                status: "cancelled",
                displayType: "ANNOUNCE",
                compareDate: co.createdAt
            })
        })

        const newReaders = await Account.aggregate([
            {
                $match: { 
                    role: "reader",
                    createdAt: { $gte: threeDaysAgo }
                }
            },
            {$sort: { createdAt: -1 }}
        ]);

        const newReadersFormatted = [];
        newReaders.map(reader => {
            newReadersFormatted.push({
                displayType: "READER",
                compareDate: reader.createdAt
            })
        })

        const combined = [...newsFormatted, ...announcesFormatted, ...cancelledOrdersFormatted, ...newReadersFormatted]
        .sort((a, b) => b.compareDate - a.compareDate);
        res.status(200).json(combined);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Get news and annouces failed!"})
    }
})
// PUT api/admin/updateLibrarian/:id
router.put("/updateLibrarian/:id", authMiddleware, checkRole(["admin"]), checkStatus(["activate"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fullName, email } = req.body;
        
        const librarian = await Librarian.findById(req.params.id).session(session);
        if (!librarian) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy thông tin thủ thư!" });
        }

        const currentAccount = await Account.findById(librarian.accountId).session(session);

        // 1. Kiểm tra và cập nhật Email nếu có thay đổi
        if (email && currentAccount && email !== currentAccount.email) {
            const existingAccount = await Account.findOne({ 
                email: email, 
                _id: { $ne: librarian.accountId } 
            }).session(session);

            if (existingAccount) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Email này đã được sử dụng cho một tài khoản khác!" });
            }
            
            await Account.findByIdAndUpdate(
                librarian.accountId,
                { $set: { email: email } },
                { session }
            );
        }

        // 2. Cập nhật Tên trong bảng Librarian
        const updatedLibrarian = await Librarian.findByIdAndUpdate(
            req.params.id,
            { $set: { fullName } },
            { new: true, session }
        ).populate('accountId', '_id email status');

        await session.commitTransaction();
        res.status(200).json({ message: "Cập nhật thông tin thành công!", data: updatedLibrarian });
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: "Cập nhật thông tin thất bại!" });
    } finally {
        session.endSession();
    }
});

// ==========================================
// ====== CODE MỚI DÀNH CHO QUẢN LÝ ĐỘC GIẢ =====
// ==========================================

// GET api/admin/readerList
router.get("/readerList", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const readerList = await Reader.find().populate('accountId', '_id email status');
        res.status(200).json(readerList);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi khi lấy danh sách độc giả"});
    }
});

// POST api/admin/addReader
router.post("/addReader", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), upload.single("avatar"), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {email, password, fullName, phoneNumber} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email và Password là bắt buộc" });
        }

        const account = await Account.findOne({ email }).session(session);
        if(account) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        
        const newAccount = new Account({
            email,
            password,
            role: "reader" 
        });
        await newAccount.save({ session });

        const readerData = {
            accountId: newAccount._id,
            fullName,
            phoneNumber: phoneNumber || "",
            avatar: req.file ? req.file.path : null
        }

        const newReader = new Reader(readerData);
        await newReader.save({ session });

        await session.commitTransaction();
        res.status(200).json({message: "Thêm độc giả thành công!"});

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({message: "Thêm độc giả thất bại!"});
    } finally {
        session.endSession();
    }
});

// PUT api/admin/updateReader/:id 
router.put("/updateReader/:id", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fullName, phoneNumber, email } = req.body;
        
        const reader = await Reader.findById(req.params.id).session(session);
        if (!reader) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy thông tin độc giả!" });
        }

        // Lấy email hiện tại của độc giả (đề phòng trường hợp reader.accountId chưa được populate)
        // Cần tìm account hiện tại để so sánh email
        const currentAccount = await Account.findById(reader.accountId).session(session);

        // 1. Xử lý cập nhật Email (nếu có truyền lên email và email đó khác email hiện tại)
        if (email && currentAccount && email !== currentAccount.email) {
            
            // SỬA Ở ĐÂY: Tìm account có email trùng, nhưng PHẢI KHÁC _id của account hiện tại
            const existingAccount = await Account.findOne({ 
                email: email, 
                _id: { $ne: reader.accountId } // $ne: Not Equal (Không bằng)
            }).session(session);

            if (existingAccount) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Email này đã được sử dụng cho một tài khoản khác!" });
            }
            
            // Cập nhật email trong bảng Account
            await Account.findByIdAndUpdate(
                reader.accountId,
                { $set: { email: email } },
                { session }
            );
        }

        // 2. Cập nhật thông tin trong bảng Reader
        const updatedReader = await Reader.findByIdAndUpdate(
            req.params.id,
            { $set: { fullName, phoneNumber, email } }, // Cập nhật cả email dự phòng trong bảng Reader (nếu có)
            { new: true, session }
        ).populate('accountId', '_id email status');

        await session.commitTransaction();
        res.status(200).json({ message: "Cập nhật thông tin thành công!", data: updatedReader });
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: "Cập nhật thông tin thất bại!" });
    } finally {
        session.endSession();
    }
});

// PATCH api/admin/toggleAccountStatus/:accountId (API Khóa/Mở khóa tài khoản)
router.patch("/toggleAccountStatus/:accountId", authMiddleware, checkRole(["admin", "librarian"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const acc = await Account.findById(req.params.accountId);
        if (!acc) return res.status(404).json({message: 'Tài khoản không tồn tại'}); 

        // Đảo ngược trạng thái hiện tại
        const newStatus = acc.status === "activate" ? "deactivate" : "activate";
        acc.status = newStatus;
        await acc.save();

        const actionText = newStatus === "activate" ? "Mở khóa" : "Vô hiệu hóa";
        res.status(200).json({ message: `Đã ${actionText.toLowerCase()} tài khoản thành công!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Đổi trạng thái tài khoản thất bại!"});
    }
});

export default router;