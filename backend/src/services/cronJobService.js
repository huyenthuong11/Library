import cron from "node-cron";
import Document from "../models/Document.js";
import Reader from "../models/user/Reader.js";

const startCronJobs = () => {

    // reset reserved expired
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

            const result = await Document.bulkWrite(bulkOps);
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


    // scan overdue
    cron.schedule("0 0 * * *", async () => {

        const now = new Date();

        try {

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

        } catch (err) {
            console.error("Cron overdue error:", err);
        }

    }, { timezone: "Asia/Ho_Chi_Minh" });

};

export default startCronJobs;