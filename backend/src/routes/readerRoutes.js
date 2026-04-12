import express from "express";
import Reader from "../models/user/Reader.js";
import upload from "../middleware/imageMiddleware.js";
import fs from "fs";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import BorrowRecord from "../models/BorrowRecord.js";
import Document from "../models/Document.js";
import mongoose from "mongoose";
import { error } from "console";

const router = express.Router();

// GET /api/reader/readerProfile
router.get("/readerProfile", authMiddleware, checkRole(["reader"]), async(req, res) => {
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
router.put("/:id", authMiddleware, checkRole(["reader"]), async(req, res) => {
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
        console.error("Error: - readerRoutes.js:40", err)
        res.status(500).json({ message: "Failed to update reader profile" });
    }
});

//PUT api/reader/:id/avatar
router.put("/:id/avatar", authMiddleware, checkRole(["reader"]), upload.single("avatar"), async(req, res) => {
    try {
        const updateFields = {};
        if (req.file) {updateFields.avatar = req.file.path;}
        const reader = await Reader.findById(req.params.id);
        if (reader.avatar) {
            const oldPath = path.join(process.cwd(), reader.avatar);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
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

//POST api/reader/borrowBook/:id
router.post("/borrowBook/:id", authMiddleware, checkRole(["reader"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {readerId} = req.body;
        const reader = await Reader.findById(readerId).session(session);
        const book = await Document.findById(req.params.id).session(session);
        if (!reader) return res.status(404).json({ message: "Người dùng không tồn tại!" });
        if(reader.borrowTurn <= 0) return res.status(400).json({ message: "Người dùng không đủ lượt mượn sách!" })
        if(!book) return res.status(404).json({ message: "Sách không tồn tại!" });
        if(book.availableCopies === 0) return res.status(404).json({ message: "Sách này hiện đã bị mượn hết!" });
        const doc = await Document.findOne(
            {_id: req.params.id, "locations.status": "available"},
            {"locations.$": 1}
        ).session(session);
        const copy = doc.locations[0];

        await BorrowRecord.create(
            [{
                readerId: reader._id,
                documentId: req.params.id,
                copyId: copy._id,
                action: "registered"
            }],
            {session},
            { new: true, runValidators: true }
        );

        await Document.findOneAndUpdate(
            { 
                _id: req.params.id,
                "locations._id": copy._id
             },
            {
                $set: {
                    "locations.$.isDeleted": false, 
                    "locations.$.status": "reserved", 
                    "locations.$.readerId" : reader._id, 
                    "locations.$.readerName": reader.fullName, 
                    "locations.$.createdAt": new Date(), 
                    "locations.$.dueDate": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
                },
                $inc: {
                    "availableCopies": -1
                }
            },
            {
                session,
                new: true, 
                runValidators: true, 
            }
        );

        await Reader.findByIdAndUpdate(
            reader._id,
            {
                $inc: {
                    "totalBorrow": 1,
                    "borrowTurn": -1
                }
            },
            {session}
        );

        await session.commitTransaction();
        res.status(200).json({ message: "Đăng ký mượn thành công!" });
    } catch (err) {
        await session.abortTransaction();
        console.error("Giao dịch thất bại", err);
        res.status(500).json({ message: "Đăng ký mượn thất bại", error: err.message });
    } finally {
        session.endSession();
    }
})

//GET api/reader/bookStore/:readerId
router.get("/bookStore/:readerId", authMiddleware, checkRole(["reader"]), async(req, res) => {
    try {
        
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * 20;
        const {search, category} = req.query;
        let query = {};
        if (category && category !== '') {
            query.category = { $in: [category] }; 
        }
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: { $regex: searchRegex } },
                { author: { $regex: searchRegex } },
                { isbn: { $regex: searchRegex }}
            ];
        }
        
        const borrowedBookList = await Document.aggregate([
            {$match: query},
            {$unwind: "$locations"},
            {$match: {"locations.readerId": new mongoose.Types.ObjectId(req.params.readerId)}},
            {$skip: skip},
            {$limit: 20}
        ]);
        console.log(borrowedBookList);
        res.status(200).json(borrowedBookList);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi tải danh sách sách đang mượn", error: err.message});
    }
})

//PATCH api/reader/extendBorrowedDueDate/:readerId/:copyId
router.patch("/extendBorrowedDueDate/:readerId/:copyId", authMiddleware, checkRole(["reader"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const reader = await Reader.findById(req.params.readerId).session(session);
        if (!reader) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        const doc = await Document.findOne(
            {"locations._id": req.params.copyId}
        )
        const copy = doc.locations.find(
            loc => loc._id.toString() === req.params.copyId
        )
        const currentDueDate = copy?.dueDate;
        if(copy.remainingExtendCount <= 0) return res.status(400).json({message: "Không đủ lượt gia hạn!"})
        const updatedDoc = await Document.findOneAndUpdate(
            {
                locations: {
                    $elemMatch: {
                        _id: req.params.copyId,
                        readerId: req.params.readerId
                    }
                }
            },
            {
                $set: {
                    "locations.$.dueDate": new Date(currentDueDate.getTime() + 5 * 24 * 60 * 60 * 1000)
                },
                $inc: {
                    "locations.$.remainingExtendCount": -1
                }
            },
            {session}
        );

        if (!updatedDoc) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy bản sao sách" });
        }

        await session.commitTransaction();
        res.status(200).json({ message: "Gia hạn sách thành công!" });
    } catch (err) {
        await session.abortTransaction();
        console.error("Gia hạn thất bại", err);
        res.status(500).json({ message: "Giao hạn thất bại", error: err.message });
    } finally {
        session.endSession();
    }
})
//PATCH api/reader/cancelReserved/:readerId/:copyId
router.patch("/cancelReserved/:readerId/:copyId", authMiddleware, checkRole(["reader"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const reader = await Reader.findById(req.params.readerId).session(session);
        if (!reader) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        const updatedDoc = await Document.findOneAndUpdate(
            {
                locations: {
                    $elemMatch: {
                        _id: req.params.copyId,
                        readerId: req.params.readerId
                    }
                }
            },
            {
                $set: {
                    "locations.$.readerId": null,
                    "locations.$.readerName": null,
                    "locations.$.dueDate": null,
                    "locations.$.createdAt": null,
                    "locations.$.status": "available",
                    "locations.$.remainingExtendCount": 3
                },
                $inc: {
                    "availableCopies": 1
                }
            },
            {session}
        );
        if (!updatedDoc) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy bản sao sách" });
        }

        await BorrowRecord.create(
            [{
                readerId: req.params.readerId,
                documentId: updatedDoc._id,
                copyId: req.params.copyId,
                action: "canceled",
                date: new Date()
            }],
            {session}
        );

        await Reader.findByIdAndUpdate(
            reader._id,
            {
                $inc: {
                    "borrowTurn": 1
                }
            },
            {session}
        );

        await session.commitTransaction();
        res.status(200).json({ message: "Hủy mượn sách thành công!" });
    } catch (error) {
        await session.abortTransaction();
        console.error("Hủy mượn sách thất bại", err);
        res.status(500).json({ message: "Hủy mượn sách thất bại", error: err.message });
    } finally {
        session.endSession();
    }
})

/*
//POST api/reader/borrowedHistory/:readerId
router.post("/borrowHistory/:readerId", authMiddleware, checkRole(["reader"]), async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * 20;
        const borrowedHistory = BorrowRecord
        .find(
            {$elemMatch: {
                readerId: req.params.readerId,
                action: "borrowed"
            }}
        )
        .populate("readerId")
        .populate("documentId")
        .skip(skip)
        .limit(20);
        res.status(200).json(borrowedHistory);
    } catch (err) {
        res.status(500).json({message: "Tải lịch sử mượn thất bại!"})
    }
})
*/
export default router;