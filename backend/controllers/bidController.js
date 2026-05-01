import Product from "../models/Product.js";
import Bid from "../models/Bid.js";

// 🔥 PLACE BID
export const placeBid = async (req, res) => {
  try {
    const productId = req.params.productId;

    // 🔥 convert to number
    const amount = Number(req.body.amount);

    // ❌ invalid amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid bid amount" });
    }

    const product = await Product.findById(productId);

    // ❌ product not found
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // ❌ not auction
    if (!product.isAuction) {
      return res.status(400).json({ msg: "Not an auction product" });
    }

    // ❌ auction ended
    if (product.endTime && new Date() > new Date(product.endTime)) {
      return res.status(400).json({ msg: "Auction ended" });
    }

    // ❌ bid too low
    if (amount <= product.currentBid) {
      return res
        .status(400)
        .json({ msg: "Bid must be higher than current bid" });
    }

    // ✅ update product
    product.currentBid = amount;
    product.highestBidder = req.user.id;

    await product.save();

await Bid.create({
  user: req.user.id,
  product: product._id,
  amount,
});

// 🔥 FETCH AGAIN WITH POPULATE
const populatedProduct = await Product.findById(product._id)
  .populate("highestBidder", "name");

// 🔥 SEND POPULATED DATA
global.io.emit("newBid", populatedProduct);

    res.json({
      msg: "Bid placed successfully",
      product,
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// 📜 GET BID HISTORY
export const getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ product: req.params.productId })
      .populate("user", "name") // 🔥 THIS IS IMPORTANT
      .sort({ createdAt: -1 });

    res.json(bids);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};