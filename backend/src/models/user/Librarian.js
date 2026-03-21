import mongoose from "mongoose";

const librarianSchema = new mongoose.Schema(
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
        hireDate: {
            type: Date,
        },
    }
);


export default mongoose.model("Librarian", librarianSchema); ;