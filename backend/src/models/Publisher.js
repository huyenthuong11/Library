import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true, 
            unique: true 
        },
        address: String,
        email: String,
        phone: String,
        website: String,
        status: { 
            type: String, 
            enum: ['Active', 'Inactive'], 
            default: 'Active' 
        }
    }, 
    { 
        timestamps: true 
    });

export default mongoose.model("Publisher", publisherSchema);