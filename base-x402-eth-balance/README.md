# Base x402 ETH Balance Service

A full-stack x402 Seller demo on Base. Users connect a browser wallet, enter any Base wallet address, pay `0.001 USDC` through x402, and receive that address's ETH balance.

This is a learning and testing project, not a production payment system.

## Stack

- Frontend: React, TypeScript, Vite, wagmi, viem, WalletConnect
- Wallets: MetaMask, Coinbase Wallet, OKX Wallet through injected connectors, plus WalletConnect
- Backend: Node.js, TypeScript, Express, official x402 SDK, viem
- Chain: Base
- Token: USDC

## Structure

```text
base-x402-eth-balance/
├── frontend/
├── backend/
├── README.md
├── .env.example
└── docker-compose.yml
```

## Environment

Copy the root example:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set:

```env
SELLER_ADDRESS=0xYourSellerReceivingAddress
BASE_RPC_URL=https://your-base-rpc.example
X402_NETWORK=base
PRICE=0.001

VITE_API_URL=http://localhost:3001
VITE_X402_NETWORK=base-sepolia
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

`X402_NETWORK=base-sepolia` maps to `eip155:84532` and works with the public x402 facilitator. `X402_NETWORK=base` maps to Base mainnet (`eip155:8453`), but the public `https://x402.org/facilitator` endpoint may reject it if mainnet settlement is not supported by the facilitator.

## Local Development

Install backend:

```bash
cd backend
npm install
npm run dev
```

Install frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## Test Flow

1. Start backend with `npm run dev` in `backend/`.
2. Start frontend with `npm run dev` in `frontend/`.
3. Open the frontend.
4. Connect MetaMask, Coinbase Wallet, OKX Wallet, or WalletConnect.
5. Make sure the wallet is on Base and has USDC plus ETH for any required gas.
6. Enter a Base wallet address.
7. Click `Check ETH Balance`.
8. The backend returns `HTTP 402 Payment Required`.
9. The frontend uses the official x402 client to create the payment header through the connected browser wallet.
10. The x402 middleware verifies and settles payment.
11. The API queries Base ETH balance with viem and returns JSON.

Backend API:

```http
GET /api/balance/:address
```

Successful response:

```json
{
  "address": "0x0000000000000000000000000000000000000000",
  "network": "base",
  "ethBalance": "0",
  "timestamp": "2026-08-04T00:00:00.000Z"
}
```

## Docker

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:3001
```

## Deploy

### Backend on Railway

The backend includes:

- `backend/Dockerfile`
- `backend/railway.json`

Railway variables:

```env
SELLER_ADDRESS=
BASE_RPC_URL=
X402_NETWORK=base-sepolia
PRICE=0.001
PORT=3001
```

### Frontend on Vercel

The frontend includes:

- `frontend/vercel.json`
- `frontend/Dockerfile`

Vercel variables:

```env
VITE_API_URL=https://your-railway-backend-url
VITE_WALLETCONNECT_PROJECT_ID=
```

## Security Rules

- The server never receives or stores user private keys.
- Users pay from browser wallets only.
- This app does not implement swaps, transfer APIs, approve APIs, asset management, automatic trading, private-key storage, or custom smart contracts.
- The only server-side blockchain action is reading public Base ETH balances after x402 payment verification and settlement.

## Commands

Backend:

```bash
cd backend
npm install
npm run typecheck
npm run build
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run typecheck
npm run build
npm run dev
```
