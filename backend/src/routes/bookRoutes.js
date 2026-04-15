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


// GET /api/books/availableBook
router.get("/availableBook", async(req, res) => {
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
        const inventorySummary = await Document.aggregate([
            { $unwind: "$locations" },
            {
                $group: {
                    _id: null,
                    totalCopies: { $sum: 1 },
                    available: { $sum: { $cond: [{ $eq: ["$locations.status", "available"] }, 1, 0] } },
                    borrowed: { $sum: { $cond: [{ $eq: ["$locations.status", "borrowed"] }, 1, 0] } },
                    overdue: { $sum: { $cond: [{ $eq: ["$locations.status", "overdue"] }, 1, 0] } },
                    reserved: { $sum: { $cond: [{ $eq: ["$locations.status", "reserved"] }, 1, 0] } }
                }
            }
        ]);
        
        const total = await Document.countDocuments();
        const books = await Document
            .find(query)
            .populate('publisherId')
            .populate("locations.readerId")
            .skip(skip)
            .limit(20);
        const totalBooks = await Document.countDocuments(query);
        res.json({
            data: books,
            totalPages: Math.ceil(totalBooks / 20),
            totalBook: total,
            inventorySum: inventorySummary[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get available book" });
    }
})

// GET /api/books/10newestBooks
router.get("/10newestBooks", async(req, res) => {
    try {
        const books = await Document
        .find()
        .sort({createdAt: -1})
        .limit(10);

        res.json({
            data: books,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get 5 newest book", err });
    }
})

// GET /api/books/mostBorrowedBooks?limit=limit
router.get("/mostBorrowedBooks", async(req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const books = await Document
        .find()
        .sort({borrowedCount: -1})
        .limit(limit);

        res.json({
            data: books,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get 5 newest book", err });
    }
})

// DELETE /api/books/deleteBook/:id
router.delete("/deleteBook/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const rawBook = await Document.findOne(
            { _id: req.params.id },
            { locations: 1 }
        ).lean();

        
        if (!rawBook) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }

        await Document.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    deleted: true,
                    "locations.$[].isDeleted": true
                }
            }
        );

        const posCount = {};
        
        rawBook.locations.forEach(loc => {
            posCount[loc.position] = (posCount[loc.position] || 0) + 1;
        });

        await Promise.all(
            Object.entries(posCount).map(([position, count]) => 
                LocationList.updateOne(
                    { position },
                    { $inc: { usedStorage: -count } }
                )
            )
        );

        res.status(200).json({ message: "Xóa sách thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Xóa sách thất bại", err });
    }
})

// DELETE /api/books/deleteCopy/:id
router.delete("/deleteCopy/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const { id } = req.params;

        const book = await Document.findOne(
            { "locations._id": id },
            { "locations.$": 1 }
        );

        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy bản copy này!" });
        }

        await Document.updateOne(
            { "locations._id": id },
            {
                $pull: { locations: { _id: id } },
                $inc: { numberOfCopy: -1, availableCopies: -1 }
            }
        );
        
        const position = book.locations[0].position;

        await LocationList.updateOne(
            { position },
            { $inc: { usedStorage: -1 } }
        );

        res.status(200).json({ message: "Xóa bản copies thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Xóa sách thất bại", err });
    }
})

//PATCH /api/books/updateBook/:id
router.patch("/updateBook/:id", authMiddleware, checkRole(["admin", "librarian"]), upload.single("image"), async(req, res) => {
    try {
        const { category, style, publisherId, 
            title, coverPrice, publishDate, author, 
            description, language, pages} = req.body;
        const book = await Document.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
        const updateFields = {};
        if (category) {
            updateFields.category = Array.isArray(category) ? category : [category];
        }
        if (style) updateFields.style = style;
        if (publisherId) updateFields.publisherId = publisherId;
        if (title) updateFields.title = title;
        if (coverPrice) updateFields.coverPrice = coverPrice;
        if (publishDate) updateFields.publishDate = publishDate;
        if (author) updateFields.author = author;
        if (description) updateFields.description = description;
        if (language) updateFields.language = language;
        if (pages) updateFields.pages = pages;
        if (req.file) {
            updateFields.image = req.file.path;
            if (book.image) {
                const oldPath = path.join(process.cwd(), book.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }
        const updateBook = await Document.findByIdAndUpdate(
            req.params.id,
            updateFields,
            {new: true, runValidators: true}
        );
        if (!updateBook) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
         res.json({
            message: "Chỉnh sửa thành công",
            data: updateBook
        });       
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Chỉnh sửa thất bại", err });
    }
})

//PATCH /api/books/updateCopy/:id
router.patch("/updateCopy/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const { position, status, readerId } = req.body;
        const updateFields = {
            $set: {},
            $inc: {}
        };
        
        let actionRecord = null;
        
        if (status!== undefined) {
            updateFields.$set["locations.$.status"] = status;
        }
        const copy = await Document.findOne({ "locations._id": req.params.id });
        if (!copy) {
            return res.status(404).json({ message: "Không tìm thấy bản copy" });
        }
        const location = copy.locations.id(req.params.id);
        const currentPos = copy.locations.id(req.params.id).position;
        if (position) {
            updateFields.$set["locations.$.position"] = position;
            await LocationList.updateOne(
                { position: position },
                { $inc: { usedStorage: 1 } }
            );
            await LocationList.updateOne(
                { position: currentPos },
                { $inc: { usedStorage: -1 } }
            );
        }
        if (!location) {
        return res.status(404).json({ message: "Không tìm thấy copy" });
        }

        const currentStatus = copy.locations.id(req.params.id).status;
        const currentReaderId = copy.locations.id(req.params.id).readerId;
        
        if (readerId !== currentReaderId?._id.toString() && currentStatus !== "available") {
            return res.status(400).json({
                message: "Chỉ có thể thay đổi độc giả khi sách ở trạng thái 'Có sẵn'"
            });
        }
        if (
            currentStatus === "available" &&
            (status === "reserved" || status === "borrowed")
        ) {
            const reader = await Reader.findById(readerId);
            if (!reader) {
                return res.status(404).json({ message: "Không tìm thấy độc giả" });
            }

            if (reader.borrowTurn <= 0) {
                return res.status(400).json({
                    message: "Người đọc đã hết lượt mượn sách!"
                });
            }
        }
        if (status === "reserved" || status === "borrowed") {
            if (!readerId) {
                return res.status(400).json({ message: "ID độc giả là bắt buộc khi cập nhật trạng thái thành [Đặt trước] hoặc [Đang mượn]" });
            }
        }
        if (status && currentStatus !== status) {
            updateFields.$set["locations.$.createdAt"] = new Date();
            if (readerId && status !== "available") {
                const reader = await Reader.findById(readerId);
                if (reader) {
                    updateFields.$set["locations.$.readerId"] = readerId;
                    updateFields.$set["locations.$.readerName"] = reader.fullName;
                    if (status === "borrowed" && currentStatus !== "borrowed") {
                        await Reader.findByIdAndUpdate(
                            readerId,
                            { $inc: { totalBorrow: 1 } }
                        );
                    }
                } else if(!reader) {  
                    return res.status(404).json({ message: "Không tìm thấy độc giả" });
                }
            }
            if ((currentStatus === "borrowed" || currentStatus === "reserved") && 
                    (status === "borrowed" || status === "reserved")) {
                if (status === "borrowed") {
                    if (currentStatus === "reserved") updateFields.$inc.borrowedCount = 1; 
                    updateFields.$set["locations.$.dueDate"] = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
                    actionRecord = "borrowed";
                } else {
                    updateFields.$set["locations.$.dueDate"] = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                    actionRecord = "reserved";
                    updateFields.$inc.borrowedCount = -1;
                }
            } else if (currentStatus === "available") {
                updateFields.$inc.availableCopies = -1;
                await Reader.findByIdAndUpdate(
                    readerId,
                    {$inc: {"borrowTurn": -1}}
                );
                if (status === "borrowed") {
                    updateFields.$inc.borrowedCount = 1;
                    updateFields.$set["locations.$.dueDate"] = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
                    actionRecord = "borrowed";
                } else if (status === "reserved") {
                    updateFields.$set["locations.$.dueDate"] = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                    actionRecord = "registered";
                }
            } else if (status === "available") {
                updateFields.$inc.availableCopies = 1;
                updateFields.$set["locations.$.readerId"] = null;
                updateFields.$set["locations.$.readerName"] = null;
                updateFields.$set["locations.$.dueDate"] = null;
                updateFields.$set["locations.$.createdAt"] = null;
                updateFields.$set["locations.$.remainingExtendCount"] = 3;
                if (currentStatus === "borrowed") {
                    actionRecord = "returned";
                }
                await Reader.findByIdAndUpdate(
                    currentReaderId,
                    {$inc: {"borrowTurn": 1}}
                );
            }
        }


        if (Object.keys(updateFields.$inc).length === 0) delete updateFields.$inc;
        if (Object.keys(updateFields.$set).length === 0) delete updateFields.$set;

        const updateCopy = await Document.findOneAndUpdate(
            {
                locations: {
                    $elemMatch: {
                        _id: req.params.id,
                        status: currentStatus
                    }
                }
            },
            updateFields,
            { new: true, runValidators: true }
        ).populate("locations.readerId");
 

        if (!updateCopy) {
            return res.status(404).json({ message: "Không tìm thấy bản copy" });
        }
        
        if (actionRecord && currentStatus!== status) {
            await BorrowRecord.create({
                readerId: readerId || currentReaderId,
                documentId: copy._id,
                copyId: req.params.id,
                action: actionRecord,
                date: new Date()
            });
        }
        res.json({
            message: "Cập nhật bản copy thành công",
            data: updateCopy
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Cập nhật bản copy thất bại", err });
    }
})

//POST /api/books/addBook
router.post("/addBook", authMiddleware, checkRole(["admin", "librarian"]), upload.single("image"), async(req, res) => {
    try {
        const { 
            category, publisherId, title, coverPrice, publishDate, 
            author, description, language, pages, numberOfCopy, 
            isbn, position 
        } = req.body;
        
        const existingBook = await Document.findOne({ title, author, isbn });
        if (existingBook) {
            return res.status(400).json({ message: "Sách đã tồn tại trong hệ thống" });
        }
        
        const posArray = Array.isArray(position) ? position : [position];
        const locations = posArray.map(pos => ({
            position: pos,
            status: "available",
            readerId: null,
            dueDate: null
        }));
        const bookData = {
            title,
            author,
            publisherId,
            coverPrice,
            publishDate,
            description: description || "Không có mô tả",
            language,
            pages,
            isbn,
            style: "book",
            category: Array.isArray(category) ? category : [category],
            numberOfCopy: Number(numberOfCopy) || 0,
            availableCopies: Number(numberOfCopy) || 0,
            borrowedCount: 0,
            locations: locations,
            image: req.file ? req.file.path : null
        };

        const newBook = new Document(bookData);
        await newBook.save();

        const posCounts = posArray.reduce((acc, p) => {
            acc[p] = (acc[p] || 0) + 1;
            return acc;
        }, {});

        const uniquePositions = Object.keys(posCounts);
        const shelves = await LocationList.find({ position: { $in: uniquePositions } });
        for (const shelf of shelves) {
            const spaceNeeded = posCounts[shelf.position];
            const currentSpace = shelf.usedStorage || 0;
            const maxSpace = 100;
            if (currentSpace + spaceNeeded > maxSpace) {
                return res.status(400).json({ 
                    message: `Kệ ${shelf.position} không đủ chỗ! (Trống: ${maxSpace - currentSpace}, Cần: ${spaceNeeded})` 
                });
            }
        }
        await Promise.all(
            Object.entries(posCounts)
            .map(([posName, count]) => {
                return LocationList.findOneAndUpdate(
                    {position: posName}, 
                    {$inc: {usedStorage: count}}
                );
            })
        );

        return res.status(201).json({ message: "Thêm sách thành công", data: newBook });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "thêm sách thất bại", error: err.message });
    }
})

//POST /api/books/addCopy/:id
router.post("/addCopy/:id", authMiddleware, checkRole(["admin", "librarian"]), async(req, res) => {
    try {
        const {position, addNum} = req.body;
        //id is book's id not copy's id
        const book = await Document.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
        const posArray = Array.isArray(position) ? position : [position];
        const posCounts = posArray.reduce((acc, p) => {
            acc[p] = (acc[p] || 0) + 1;
            return acc;
        }, {});

        const uniquePositions = Object.keys(posCounts);
        const shelves = await LocationList.find({ position: { $in: uniquePositions } });
        for (const shelf of shelves) {
            const spaceNeeded = posCounts[shelf.position];
            const currentSpace = shelf.usedStorage || 0;
            const maxSpace = 100;
            if (currentSpace + spaceNeeded > maxSpace) {
                return res.status(400).json({ 
                    message: `Kệ ${shelf.position} không đủ chỗ! (Trống: ${maxSpace - currentSpace}, Cần: ${spaceNeeded})` 
                });
            }
        }


        await Promise.all(
            Object.entries(posCounts)
            .map(([posName, count]) => {
                return LocationList.findOneAndUpdate(
                    {
                        position: posName,
                        usedStorage: { $lte: 100 - count }
                    }, 
                    {$inc: {usedStorage: count}}
                );
            })
        );

        const locations = posArray.map(pos => ({
            position: pos,
            status: "available",
            readerId: null,
            dueDate: null
        }));
        await Document.findByIdAndUpdate(
            req.params.id,
            {
                $push: {locations: {$each: locations}},
                $inc: {
                    numberOfCopy: addNum,
                    availableCopies: addNum
                }
            },
            {
                new: true,
            }
        );
        
        return res.status(201).json({ message: "Thêm bản copy thành công"});

    } catch (err) {
        console.error("Lỗi khi thêm bản sao:", err);
        res.status(500).json({ message: "Lỗi hệ thống khi thêm bản sao", error: err.message });
    }
})

export default router;