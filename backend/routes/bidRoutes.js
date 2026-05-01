import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import { placeBid, getBids } from "../controllers/bidController.js";

const router = express.Router();

// 🔥 PLACE BID
router.post("/:productId", authMiddleware, placeBid);

// 📜 GET BID HISTORY
router.get("/:productId", getBids);

export default router;
