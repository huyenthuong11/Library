import mongoose from "mongoose";

const locationListSchema = new mongoose.Schema(
    {
        position: { type: String },
        storage: { type: Number, max: 100, default: 100 },
        usedStorage: { type: Number, max: 100, default: 0 },
    }
);

export default mongoose.model("LocationList", locationListSchema);