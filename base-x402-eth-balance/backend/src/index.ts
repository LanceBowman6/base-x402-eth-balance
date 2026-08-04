import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { balanceRouter } from "./routes/balance.js";
import { createPaymentMiddleware } from "./x402/middleware.js";
import { resolveX402Network } from "./x402/network.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";

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
