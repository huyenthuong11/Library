import cron from "node-cron";
import Document from "../models/Document.js";
import Reader from "../models/user/Reader.js";
import Account from "../models/user/Account.js";
import Violation from "../models/Violation.js";

const startCronJobs = () => {

    // 1. RESET SÁCH ĐẶT TRƯỚC HẾT HẠN (Giữ nguyên logic cũ)
    cron.schedule("0 * * * *", async () => {

        const now = new Date();

        try {

            const docs = await Document.find(
                {
                    locations: {
                        $elemMatch: {
                            status: "reserved",
                            dueDate: { $lt: now }
                        }
                    }
                },
                { locations: 1 }
            );

            if (!docs.length) return;
            const docBulkOps = [];
            const readerTurnMap = {};

            docs.forEach(doc => {
                const expiredItems = doc.locations.filter(
                    l => l.status === "reserved" && l.dueDate && l.dueDate < now
                );

                if(expiredItems.length > 0) {
                    expiredItems.forEach(item => {
                        if(item.readerId) {
                            const readerId = item.readerId.toString();
                            readerTurnMap[readerId] = (readerTurnMap[readerId] || 0) +1;
                        }
                    });

                    docBulkOps.push({
                        updateOne: {
                            filter: {_id: doc._id},
                            update: {
                                $set: {
                                    "locations.$[elem].status": "available",
                                    "locations.$[elem].readerId": null,
                                    "locations.$[elem].readerName": null,
                                    "locations.$[elem].createdAt": null,
                                    "locations.$[elem].dueDate": null
                                },
                                $inc: {availableCopies: expiredItems.length}
                            },
                            arrayFilters: [{ "elem.status": "reserved", "elem.dueDate": { $lt: now } }]
                        }
                    });
                } 
            });

            if (!docBulkOps.length) return;

            const result = await Document.bulkWrite(docBulkOps);
            const readerIds = Object.keys(readerTurnMap);
            if(readerIds.length > 0) {
                const readerBulkOps = readerIds.map(id => ({
                    updateOne: {
                        filter: {_id: id},
                        update: {$inc: {borrowTurn: readerTurnMap[id]}}
                    }
                }));
                await Reader.bulkWrite(readerBulkOps);
            }

            console.log(`[Cron] Reset ${result.modifiedCount} documents`);

        } catch (err) {
            console.error("Cron reserved error:", err);
        }

    }, { timezone: "Asia/Ho_Chi_Minh" });


    // 2. QUÉT SÁCH QUÁ HẠN VÀ TỰ ĐỘNG TẠO/CẬP NHẬT BIÊN BẢN PHẠT
    cron.schedule("0 0 * * *", async () => {

        const now = new Date();

        try {
            // Bước 2.1: Quét tìm tất cả các sách Đang Mượn hoặc Đã Quá Hạn mà dueDate < now
            const docs = await Document.find(
                {
                    locations: {
                        $elemMatch: {
                            status: { $in: ["borrowed", "overdue"] },
                            dueDate: { $lt: now }
                        }
                    }
                },
                { locations: 1 }
            );

            const violationOps = [];

            docs.forEach(doc => {
                doc.locations.forEach(item => {
                    if ((item.status === "borrowed" || item.status === "overdue") && item.dueDate && item.dueDate < now) {
                        
                        // Tính toán số ngày trễ (Làm tròn lên)
                        const diffTime = now.getTime() - new Date(item.dueDate).getTime();
                        const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        
                        // Tiền phạt = Số ngày trễ x 2.000 VNĐ
                        const fine = daysLate * 2000;

                        // Lệnh Upsert: Cập nhật biên bản (nếu đã tạo hôm qua) hoặc Tạo mới (nếu hôm nay mới trễ)
                        violationOps.push({
                            updateOne: {
                                filter: { 
                                    copyId: item._id, 
                                    status: "unpaid" // Chỉ cập nhật liên tục nếu độc giả chưa đóng tiền
                                },
                                update: {
                                    $set: {
                                        readerId: item.readerId,
                                        documentId: doc._id,
                                        copyId: item._id,
                                        reason: `Nộp muộn sách ${daysLate} ngày.`,
                                        fineAmount: fine
                                    }
                                },
                                upsert: true // Tạo mới nếu không tìm thấy filter
                            }
                        });
                    }
                });
            });

            // Bước 2.2: Chạy lệnh ghi hàng loạt Biên Bản vào CSDL
            if (violationOps.length > 0) {
                await Violation.bulkWrite(violationOps);
            }

            // Bước 2.3: Đổi status của sách từ borrowed -> overdue
            const result = await Document.updateMany(
                {
                    "locations.status": "borrowed",
                    "locations.dueDate": { $lt: now }
                },
                {
                    $set: {
                        "locations.$[elem].status": "overdue"
                    }
                },
                {
                    arrayFilters: [
                        { "elem.status": "borrowed", "elem.dueDate": { $lt: now } }
                    ]
                }
            );

            console.log(`[Cron] ${result.modifiedCount} items moved to overdue`);
            console.log(`[Cron] Auto-generated/Updated ${violationOps.length} overdue violation records`);

        } catch (err) {
            console.error("Cron overdue error:", err);
        }

    }, { timezone: "Asia/Ho_Chi_Minh" });

    //deactivate acc
    cron.schedule("12 0 * * *", async () => {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 15);
        try {
            const exAcc = await Document.aggregate([
                {$unwind: "$locations"},
                {$match: 
                    {
                        "locations.status": "overdue",
                        "locations.dueDate": {$lt: dateLimit}
                    }
                },
                {$lookup: {
                    from: "readers",
                    localField: "locations.readerId",
                    foreignField: "_id",
                    as: "reader"
                }},
                {$unwind: "$reader"},
                {$unwind: "$account"},
                {$group: {_id: "$reader.accountId"}}
            ]);

            const accIds = exAcc.map(item => item._id);

            if(accIds.length > 0) {
                await Account.updateMany(
                    {_id: {$in: accIds}},
                    {$set: {status: "deactivate"}}
                )
            }

            console.log(`Đã khóa ${accountIds.length} tài khoản quá hạn.`)
        } catch (error) {
            console.error("Lỗi khi chạy cron job:", error);
        }
    })
};

export default startCronJobs;