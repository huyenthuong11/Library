import mongoose from "mongoose";

const eBookRecordSchema = new mongoose.Schema({
    readerId: { type: mongoose.Schema.Types.ObjectId, ref: "Reader" },
    ebookId: { type: mongoose.Schema.Types.ObjectId, ref: "EBook" },
    action: { 
        type: String, 
        default: "borrowed" 
    }
}, { timestamps: true });
eBookRecordSchema.index({ readerId: 1, createdAt: -1 });
export default mongoose.model("EBookRecord", eBookRecordSchema);