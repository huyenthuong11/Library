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
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        dateOfBirth: {
            type: Date,
            default: Date.now,
        },
        phoneNumber: {
            type: String,
            default: "",
        },
        totalBorrow: {
            type: Number,
            required: true,
            default: 0,
        },
        borrowTurn: {
            type: Number,
            required: true,
            default: 10,
        }
    }
);



export default mongoose.model("Reader", readerSchema); ;