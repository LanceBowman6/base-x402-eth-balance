# Base x402 ETH Balance Service

Backend-only x402 Seller service. It exposes one paid API link:

```text
GET /api/balance/{address}
```

An unpaid request returns `HTTP 402 Payment Required`. A compatible x402 client pays `0.001 USDC`, retries with the x402 payment header, and receives the Base ETH balance.

## Public Endpoint

Railway API:

```text
https://base-x402-eth-balance-backend-production.up.railway.app
```

x402 link template:

```text
https://base-x402-eth-balance-backend-production.up.railway.app/api/balance/{address}
```

Example:

```text
https://base-x402-eth-balance-backend-production.up.railway.app/api/balance/0x0000000000000000000000000000000000000000
```

## What The API Returns

```json
{
  "address": "0x0000000000000000000000000000000000000000",
  "network": "base",
  "ethBalance": "0",
  "timestamp": "2026-08-04T00:00:00.000Z"
}
```

## Environment

```env
SELLER_ADDRESS=0xYourSellerReceivingAddress
BASE_RPC_URL=https://your-base-rpc.example
X402_NETWORK=base-sepolia
PRICE=0.001
PORT=3001
```

`SELLER_ADDRESS` is only the public receiving address. Never provide or store wallet private keys.

The public `https://x402.org/facilitator` currently works with `base-sepolia` (`eip155:84532`). It rejected Base mainnet (`eip155:8453`) during testing with `Facilitator does not support scheme "exact" on network "eip155:8453"`.

## Local Run

```bash
cd backend
npm install
npm run dev
```

Probe unpaid 402:

```bash
curl -i http://localhost:3001/api/balance/0x0000000000000000000000000000000000000000
```

## x402 Client Usage

Any x402-compatible client can call the link. The client flow is:

1. Request the API URL.
2. Receive `HTTP 402 Payment Required`.
3. Let x402 SDK parse the payment requirements.
4. User wallet signs/pays USDC.
5. Client retries with the x402 payment header.
6. API verifies payment and returns ETH balance.

## Security

- No frontend app is required.
- No buyer private key is sent to the server.
- No swap, approve endpoint, transfer endpoint, custody, automatic trading, asset management, or smart contract is implemented.
- The server only verifies x402 payment and reads public Base ETH balance data.

