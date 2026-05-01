import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  amount: Number,
}, { timestamps: true });

export default mongoose.model("Bid", bidSchema);