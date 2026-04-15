import express from "express";
import Librarian from "../models/user/Librarian.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import News from "../models/News.js";
import Document from "../models/Document.js";
const router = express.Router();


// GET /api/librarian/librarianProfile
router.get("/librarianProfile", authMiddleware, checkRole(["librarian"]), async(req, res) => {
    try {
        const {accountId} = req.query;
        const libraryProfile = await Librarian
        .findOne({accountId});
        res.status(200).json(libraryProfile);
    } catch (err) {
        res.status(500).json({ message: "Failed to get librarian profile" });
    }
});

// GET /api/librarian/getNewsAndAnnounce
router.get("/getNewsAndAnnounce", authMiddleware, checkRole(["librarian"]), async(req, res) => {
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

        const combined = [...newsFormatted, ...announcesFormatted]
        .sort((a, b) => b.compareDate - a.compareDate);
        res.status(200).json(combined);
    } catch (error) {
        res.status(500).json({message: "Get news and annouces failed!"})
    }
})

export default router;