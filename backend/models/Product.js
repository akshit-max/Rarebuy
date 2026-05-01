import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,

  price: Number, // for normal product

  isAuction: {
    type: Boolean,
    default: false,
  },

  auctionEndTime: Date,

  currentBid: {
    type: Number,
    default: 0,
  },

  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

}, { timestamps: true });

export default mongoose.model("Product", productSchema);