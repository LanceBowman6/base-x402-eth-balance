import { Router } from "express";
import { getBaseEthBalance } from "../services/blockchain.js";

export const balanceRouter = Router();

balanceRouter.get("/:address", async (req, res, next) => {
  try {
    const balance = await getBaseEthBalance(req.params.address);
    res.json(balance);
  } catch (error) {
    next(error);
  }
});
