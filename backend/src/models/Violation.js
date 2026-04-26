import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
    {
        readerId: { type: mongoose.Schema.Types.ObjectId, ref: "Reader", required: true },
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
        copyId: { type: mongoose.Schema.Types.ObjectId },
        reason: { type: String, required: true },
        fineAmount: { type: Number, required: true },
        status: { type: String, 
            enum: ["unpaid", "paid"], 
            default: "unpaid" 
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Librarian', 
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("Violation", violationSchema);