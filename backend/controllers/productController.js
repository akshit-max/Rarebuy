import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "highestBidder",
      "name",
    ); // 🔥 ADD THIS

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// CREATE PRODUCT (ADMIN)
export const createProduct = async (req, res) => {
  try {
    const { title, price, isAuction, endTime, image } = req.body;

    let imageUrl = null;

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "rarebuy",
      });

      imageUrl = uploadRes.secure_url;
    }

    const product = new Product({
      title,
      image: imageUrl,
      price: isAuction ? null : price,
      isAuction,
      auctionEndTime: isAuction && endTime ? new Date(endTime) : null,
    });

    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { title, price, isAuction, endTime } = req.body;

    const updateData = {
      title,
      isAuction,
      price: isAuction ? null : price,
      auctionEndTime: isAuction && endTime ? new Date(endTime) : null,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
