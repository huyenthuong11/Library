import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        isbn: {
            type: String,
            required: true,
            trim: true,
        },
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
            enum: ["book"],
            required: true,
        },
        publisherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Publisher'
        },
        title: {
            type: String,
            trim: true,
        },
        coverPrice: {
            type: Number,
            min: 0,
        },
        publishDate: {
            type: Date,
        },
        author: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        language: {
            type: String,
            trim: true,
        },
        pages: {
            type: Number,
            min: 1,
        },
        availableCopies: {
            type: Number,
            min: 0,
        },
        borrowedCount: {
            type: Number,
            min: 0,
        },    
        numberOfCopy: {
            type: Number,
            min: 0,
        },  
        locations: [
            {
                position: { type: String }, 
                status: { 
                    type: String, 
                    enum: ["available", "reserved", "borrowed"], 
                    default: "available" 
                },
                readerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Reader",
                    default: null
                },
                readerName: {type: String, default: null},
                createdAt: { type: Date, default: null },
                dueDate: { type: Date, default: null }
            }
        ]
    },
    {
        timestamps: true,
    }
);


export default mongoose.model("Document", documentSchema); ;