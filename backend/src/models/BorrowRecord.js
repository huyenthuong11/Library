import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema(
    {
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reader",
        },
        documentId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Document" 
        },
        copyId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        action: {
            type: String,
            enum: ["registered", "borrowed", "returned"],
            required: true,
        },
    },
    {
        timestamps: true,
    } 
);

export default mongoose.model("BorrowRecord", borrowRecordSchema);