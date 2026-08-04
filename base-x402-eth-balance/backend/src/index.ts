import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { balanceRouter } from "./routes/balance.js";
import { createPaymentMiddleware } from "./x402/middleware.js";
import { resolveX402Network } from "./x402/network.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";

app.set("trust proxy", 1);

app.use(
  cors({
    origin: allowedOrigin,
    exposedHeaders: ["PAYMENT-RESPONSE", "X-PAYMENT-RESPONSE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-PAYMENT", "Payment"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Base x402 ETH Balance Service",
    x402Network: resolveX402Network(process.env.X402_NETWORK),
  });
});

app.get("/", (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;

  res.json({
    service: "Base x402 ETH Balance Service",
    description: "x402-paid API for checking ETH balances on Base.",
    price: `${process.env.PRICE ?? "0.001"} USDC`,
    paymentNetwork: resolveX402Network(process.env.X402_NETWORK),
    sellerAddress: process.env.SELLER_ADDRESS,
    x402LinkTemplate: `${origin}/api/balance/{address}`,
    example: `${origin}/api/balance/0x0000000000000000000000000000000000000000`,
  });
});

app.use(createPaymentMiddleware());
app.use("/api/balance", balanceRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Invalid Base wallet address") ? 400 : 500;

  res.status(status).json({ error: message });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Base x402 ETH Balance Service API listening on http://localhost:${port}`);
});
