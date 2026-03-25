import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            default: "",
        },
        category: {
            type: [String],
            default: [],
            set: (arr) => arr.map(c => c.toLowerCase().trim()),
        },
        style: {
            type: String,   
            enum: ["newspaper", "book", "magazine"],
            required: true,
        },
        publisher: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        coverPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        publishDate: {
            type: Date,
            required: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        language: {
            type: String,
            required: true,
            trim: true,
        },
        pages: {
            type: Number,
            required: true,
            min: 1,
        },
        availableCopies: {
            type: Number,
            required: true,
            min: 0,
        },  
        numberOfCopy: {
            type: Number,
            required: true,
            min: 0,
        },  
    },
    {
        timestamps: true,
    }
);


export default mongoose.model("Document", documentSchema); ;