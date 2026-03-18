import mongoose from "mongoose";

const readerSchema = new mongoose.Schema(
    {
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
        },
        dateOfBird: {
            type: Date,
            default: Date.now,
        },
        phoneNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        totalBorrow: {
            type: Number,
            required: true,
            unique: true,
        }
    }
);



readerSchema.index({ accountId: 1 })
export default mongoose.model("Reader", readerSchema); ;