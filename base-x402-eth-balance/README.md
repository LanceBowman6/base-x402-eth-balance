# Base x402 ETH Balance Service

Backend-only x402 Seller service using Base mainnet USDC payments.

Paid API link:

```text
GET /api/balance/{address}
```

Unpaid requests return `HTTP 402 Payment Required`. A compatible x402 client pays `0.001 USDC` on Base mainnet, retries with the x402 payment header, and receives the wallet's ETH balance on Base.

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

## Environment

```env
SELLER_ADDRESS=0xYourSellerReceivingAddress
BASE_RPC_URL=https://your-base-rpc.example
X402_NETWORK=base
PRICE=0.001
PORT=3001
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
CDP_API_KEY_ID=
CDP_API_KEY_SECRET=
```

`SELLER_ADDRESS` is only the public receiving address. Never provide or store wallet private keys.

CDP credentials are used only to authenticate with the CDP-hosted x402 facilitator, which supports Base mainnet (`eip155:8453`) verification and settlement. The server does not custody buyer funds or buyer keys.

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

## x402 Client Flow

1. Request the API URL.
2. Receive `HTTP 402 Payment Required`.
3. Let the official x402 SDK parse the payment requirements.
4. User wallet signs/pays USDC on Base mainnet.
5. Client retries with the x402 payment header.
6. API verifies and settles payment through the facilitator.
7. API returns ETH balance JSON.

## Security

- No frontend app is required.
- No buyer private key is sent to the server.
- No swap, approve endpoint, transfer endpoint, custody, automatic trading, asset management, or smart contract is implemented.
- The server only verifies x402 payment and reads public Base ETH balance data.

