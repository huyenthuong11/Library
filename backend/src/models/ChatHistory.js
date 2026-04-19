import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reader",
            required: true,
            index: true,
        },
        message: String,
        role: {
          type: String,
          enum: ["user", "bot"],
        },
    },
    {   
        timestamps: true 
    }
);

chatMessageSchema.index({ userId: 1, createdAt: -1  });

export default mongoose.model("chatMessageSchema", chatMessageSchema);