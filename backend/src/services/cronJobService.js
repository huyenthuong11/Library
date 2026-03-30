import cron from 'node-cron';
import Document from '../models/Document.js';
const startCronJobs = () => {
    cron.schedule('0 * * * *', async () => {
        const now = new Date();
        try {
            const result = await Document.updateMany(
                {
                    "location.status": "reserved",
                    "locations.dueDate": {$lt: now}
                },
                {
                    $set: {
                        "locations.$[elem].status": "available",
                        "locations.$[elem].userId": null,
                        "locations.$[elem].createdAt": null,
                        "locations.$[elem].dueDate": null
                    }
                },
                {
                    arrayFilters: [{ "elem.status": "reserved", "elem.dueDate": { $lt: now } }]
                }
            );
        } catch (err) {
            console.error('Lỗi quét reserved:', err);
        }
    });
    cron.schedule('0 0 * * *', async () => {
        const now = new Date();
        try {
            const result = await Document.updateMany(
                {
                    "location.status": "borrowed",
                    "locations.dueDate": {$lt: now}
                },
                {
                    $set: {
                        "locations.$[elem].status": "overdue",
                    }
                },
                {
                    arrayFilters: [{ "elem.status": "borrowed", "elem.dueDate": { $lt: today } }]
                }
            );
        } catch (err) {
            console.error('Lỗi quét overdue:', err);
        }
    });
}

export default startCronJobs;