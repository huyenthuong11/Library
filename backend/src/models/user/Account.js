import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const accountSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        status: String,
        role: {
            type: String,   
            enum: ["reader", "librarian"]   
        },
    },
    {
        timestamps: true,
    }
);

accountSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Account = mongoose.model("Account", accountSchema); 

export default Account;