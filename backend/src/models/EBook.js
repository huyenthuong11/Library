import mongoose from "mongoose";

const ebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true
    },

    author: {
      type: String,
      default: "Không rõ",
      index: true
    },

    content: {
      type: String,
      required: true
    },

    readerId: [
      {
        reader: { type: mongoose.Schema.Types.ObjectId, ref: "Reader" },
        borrowedAt: { type: Date, default: Date.now }
      }
    ],

    borrowedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true
  }
);

ebookSchema.index({
  title: "text",
  author: "text",
  content: "text"
});


export default mongoose.model("Ebook", ebookSchema);