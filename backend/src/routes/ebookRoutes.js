import express from "express";
import mongoose from "mongoose";
import EBook from "../models/EBook.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";
import EBookRecord from "../models/EBookRecord.js";
import Reader from "../models/user/Reader.js";



const router = express.Router();

//GET /api/ebooks/availableEBooks/:readerId
router.get("/availableEBooks/:readerId", authMiddleware, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * 15;
        const {search} = req.query;
        
        let query = {};
        let sort = { createdAt: 1 };
        let projection = {};

        if (search) {
            query = { $text: { $search: search } };
            projection = { score: { $meta: "textScore" } };
            sort = { score: { $meta: "textScore" } };
        }

        const availableEBooks = await EBook
        .find({
            ...query,
            "readerId.reader": {$ne: req.params.readerId}
        }, projection)
        .sort(sort)
        .skip(skip)
        .limit(15)
        .select("-readerId")
        .select("-content");

        const totalBooks =  await EBook
        .countDocuments(query);
        res.status(200).json({
            data: availableEBooks,
            totalPages: Math.ceil(totalBooks / 15),
        });
    } catch (error) {
        console.log("Lấy danh sách Ebook thất bại:", error);
        res.status(500).json("Lấy danh sách Ebook thất bại");
    }
})


//POST api/ebooks/borrowBook/:readerId/:id
router.post("/borrowBook/:readerId/:id", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reader = await Reader.findById(req.params.readerId);
        if (!reader) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        await EBook.findOneAndUpdate(
            {_id: req.params.id},
            {$addToSet: 
                {readerId: {
                    reader: req.params.readerId,
                    borrowedAt: new Date()
                }}
            },
            {$inc: {borrowedCount: 1}},
            {
                session,
                new: true 
            }
        );

        await EBookRecord.create(
            [{
                readerId: req.params.readerId,
                ebookId: req.params.id,
                action: "borrowed"
            }],
            { session }
        );

        await session.commitTransaction();
        res.status(200).json("Mượn sách thành công!");
    } catch (error) {
        await session.abortTransaction();
        console.log("Lỗi xảy ra khi đang mượn sách:", error);
        res.status(500).json("Lỗi xảy ra khi đang mượn sách.")
    } finally {
        await session.endSession();
    }
})


//GET api/ebooks/getBooks/:id
router.get("/getBooks/:id", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) =>  {
    try {
        const book = await EBook.findById(req.params.id).select("-readerId");
        res.status(200).json(book);
    } catch (error) {
        console.log(error);
        res.status(500).json("Lỗi lấy thông tin sách")
    }
})

//PATCH api/ebooks/return/:readerId/:id
router.patch("/return/:readerId/:id", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) =>{
    try {
        await EBook.updateOne(
            {"readerId.reader": req.params.readerId},
            {$pull: {readerId: {reader: req.params.readerId}}},
            {new: true}
        );
        res.status(200).json("Trả sách thành công!")
    } catch (error) {
        console.log(error);
        res.status(500).json("Lỗi trả sách")
    }
})
export default router;
